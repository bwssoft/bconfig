import { useEffect, useState, useRef, useCallback } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definition/serial"
import { sleep } from "../lib/util/sleep"
import { E3 } from "../lib/parser/E3"
import { ConfigurationMetadata, DeviceNativeProfile, DeviceProfile, IProfile } from "../lib/definition"
import { E3Encoder } from "../lib/encoder/E3"
import { checkWithDifference } from "../lib/util"
import { toast } from "./use-toast"
import { createOneConfigurationLog } from "../lib/action/configuration-log.action"


interface Identified {
  isIdentified: boolean
  port: ISerialPort
  imei?: string
  iccid?: string
  et?: string
}
interface IdentifiedLog {
  port: ISerialPort
  label: string
  progress: number
}


export interface Configuration {
  id: string
  port: ISerialPort;
  imei: string
  iccid?: string
  et: string
  desired_profile: DeviceProfile;
  actual_profile?: DeviceProfile;
  actual_native_profile?: DeviceNativeProfile;
  is_configured: boolean;
  not_configured: { [key in keyof IProfile["config"]]: { value1: any; value2: any } };
  metadata: ConfigurationMetadata;
  profile_name: string
  profile_id: string
}
interface ConfigurationLog {
  imei: string
  label: string
  progress: number
}

type DeviceResponse = string | undefined

export function useE3Communication(props: { profile?: IProfile }) {
  const { profile } = props
  const [identified, setIdentified] = useState<Identified[]>([])
  const [identifiedLog, setIdentifiedLog] = useState<IdentifiedLog[]>([])
  const [inIdentification, setInIdentification] = useState<boolean>(false)

  const [configuration, setConfiguration] = useState<Configuration[]>([]);
  const [configurationLog, setConfigurationLog] = useState<ConfigurationLog[]>([])
  const [inConfiguration, setInConfiguration] = useState<boolean>(false)

  const previousPorts = useRef<ISerialPort[]>([])
  const disconnectedPorts = useRef<ISerialPort[]>([])

  const handleSerialDisconnection = useCallback((port: ISerialPort) => {
    toast({
      title: "Desconexão!",
      description: "Equipamento desconectado!",
      variant: "success",
      className: "destructive group border bg-stone-400 border-stone-300 text-white"
    })
    disconnectedPorts.current.push(port)
    setIdentified(prev => {
      const _identified = prev.find(el => el.port === port);
      const updatedIdentified = prev.filter(el => el.port !== port);
      setIdentifiedLog(prevLog => prevLog.filter(el => el.port !== port));
      setConfigurationLog(prevLog => prevLog.filter(el => el.imei !== _identified?.imei));
      setConfiguration(prevConfig => prevConfig.filter(el => el.imei !== _identified?.imei));
      return updatedIdentified;
    });
  }, [setIdentified, setConfiguration])

  const handleSerialConnection = (port: ISerialPort) => {
    toast({
      title: "Conexão!",
      description: "Equipamento conectado!",
      variant: "success",
    })
  }

  const { ports, writeToPort, openPort, getReader, requestPort, closePort } = useSerial({
    handleDisconnection: handleSerialDisconnection,
    handleConnection: handleSerialConnection
  })

  //
  const readDeviceResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>, command: string) => {
    const decoder = new TextDecoder()
    let buffer = ""
    let foundCommandResponse = false
    const timeoutPromise = new Promise<undefined>((resolve) =>
      setTimeout(() => resolve(undefined), 500)
    );

    const readPromise = (async () => {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        let lines = buffer.split("\r\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.length > 0) {
            if (line.includes(`SMS:${command}`)) {
              foundCommandResponse = true;
            } else if (foundCommandResponse) {
              return line;
            }
          }
        }
      }
      return undefined;
    })();

    return Promise.race([readPromise, timeoutPromise]);
  }
  const sendCommandWithRetries = async (port: ISerialPort, command: string) => {
    let attempts = 0;
    const maxRetries = 3
    while (attempts < maxRetries) {
      await sleep(100)
      const reader = await getReader(port)
      if (!reader) return
      try {
        await writeToPort(port, command);
        const response = await readDeviceResponse(reader, command);
        await reader.cancel()
        reader.releaseLock()
        if (response) return response
      } catch (error) {
        await reader.cancel()
        reader.releaseLock()
        console.error(`ERROR [sendCommandWithRetries] ${attempts + 1} for command ${command}:`, error);
      }
      attempts++;
    }
  }

  //
  const getDeviceIdentification = async (props: {
    port: ISerialPort,
    callback: {
      onOpenPort: () => void
      onPortOpened: () => void
      onReg: () => void
      onSms: () => void
      onEn: () => void
      onImei: () => void
      onIccid: () => void
      onEt: () => void
      onClosePort: () => void
      onFinished: () => void
    }
  }, depth = 3): Promise<Identified | undefined> => {
    const { port, callback } = props
    if (port.readable && port.writable) return
    if (depth <= 0) return undefined
    try {
      callback.onOpenPort()
      await openPort(port);
      callback.onPortOpened()
      // let attempts = 0
      // const max_retries = 3
      // Main loop to gather device info
      // while (attempts < max_retries && (!imei || !iccid || !et)) {
      callback.onReg()
      const reg = await sendCommandWithRetries(port, "REG000000#");
      if (!reg) {
        await closePort(port);
        return undefined
      }
      callback.onSms()
      await sendCommandWithRetries(port, "SMS1");
      callback.onEn()
      await sendCommandWithRetries(port, "EN");

      callback.onImei()
      const imei = await sendCommandWithRetries(port, "IMEI");
      callback.onIccid()
      const iccid = await sendCommandWithRetries(port, "ICCID");
      callback.onEt()
      const et = await sendCommandWithRetries(port, "ET");
      //   attempts++
      // }
      const isIdentified = imei !== undefined && iccid !== undefined && et !== undefined
      callback.onClosePort()
      await closePort(port);
      callback.onFinished()
      return {
        port,
        iccid: iccid ? E3.iccid(iccid) : undefined,
        imei: imei ? E3.imei(imei) : undefined,
        et: et ? E3.et(et) : undefined,
        isIdentified
      }
    } catch (e) {
      console.error("ERROR [getDeviceIdentification]", e);
      await closePort(port);
      return await getDeviceIdentification(props);
    }
  };
  const getDeviceProfile = async (port: ISerialPort, depth = 3): Promise<{ profile: DeviceProfile, native_profile: DeviceNativeProfile } | undefined> => {
    if (port.readable && port.writable) return
    if (depth <= 0) return undefined
    try {
      await openPort(port);
      // let attempts = 0
      // const max_retries = 3
      let check: DeviceResponse, cxip: DeviceResponse, dns: DeviceResponse, gs: DeviceResponse;
      // while (attempts < max_retries && (!check || !cxip || !dns)) {
      await sendCommandWithRetries(port, "REG000000#");
      await sendCommandWithRetries(port, "SMS1");
      await sendCommandWithRetries(port, "EN");
      if (!check) check = await sendCommandWithRetries(port, "CHECK");
      if (!cxip) cxip = await sendCommandWithRetries(port, "CXIP");
      if (!dns) dns = await sendCommandWithRetries(port, "DNS");
      if (!gs) gs = await sendCommandWithRetries(port, "GS");
      //   attempts++
      // }
      await closePort(port);
      const _check = check ? E3.check(check) : undefined;
      return {
        profile: {
          ip: cxip ? E3.ip(cxip) : undefined,
          dns: dns ? E3.dns(dns) : undefined,
          apn: _check?.apn ?? undefined,
          timezone: _check?.timezone ?? undefined,
          lock_type: _check?.lock_type ?? undefined,
          data_transmission: _check?.data_transmission ?? undefined,
          odometer: _check?.odometer ?? undefined,
          keep_alive: _check?.keep_alive ?? undefined,
          accelerometer_sensitivity: _check?.accelerometer_sensitivity ?? undefined,
          economy_mode: _check?.economy_mode ?? undefined,
          lbs_position: _check?.lbs_position ?? undefined,
          cornering_position_update: _check?.cornering_position_update ?? undefined,
          ignition_alert_power_cut: _check?.ignition_alert_power_cut ?? undefined,
          gprs_failure_alert: _check?.gprs_failure_alert ?? undefined,
          led: _check?.led ?? undefined,
          virtual_ignition: _check?.virtual_ignition ?? undefined,
          work_mode: _check?.work_mode ?? undefined,
          sensitivity_adjustment: gs ? E3.sensitivity_adjustment(gs) : undefined,
        },
        native_profile: {
          cxip,
          check,
          dns
        }
      }
    } catch (e) {
      console.error("ERROR [getDeviceProfile]", e);
      await closePort(port);
      return await getDeviceProfile(port, depth - 1);
    }
  };
  const configureDevice = async (input: {
    port: ISerialPort,
    commands: string[],
    callback: {
      onOpenPort: () => void
      onPortOpened: () => void
      onSendCommand: (command: string, idx: number) => void
      onClosePort: () => void
      onFinished: () => void
    }
  }): Promise<ConfigurationMetadata> => {
    const { port, commands, callback } = input
    try {
      const commands_sent = []
      callback.onOpenPort()
      await openPort(port)
      callback.onPortOpened()
      const init_time_configuration = Date.now()
      for (let c = 0; c < commands.length; c++) {
        const command = commands[c]
        const init_time_command = Date.now()
        callback.onSendCommand(command, c)
        const response = await sendCommandWithRetries(port, command);
        const end_time_command = Date.now()
        commands_sent.push({
          response,
          request: command,
          init_time_command,
          end_time_command: response ? end_time_command : undefined
        })
      }
      const end_time_configuration = Date.now()
      callback.onClosePort()
      await closePort(port)
      callback.onFinished()
      return {
        init_time_configuration,
        end_time_configuration,
        commands_sent,
        port
      }
    } catch (e) {
      console.error('ERROR [configureDevice]', e);
      await closePort(port)
      return await configureDevice({ port, commands, callback })
    }
  }


  //
  const handleDeviceIdentification = async (ports: ISerialPort[]) => {
    try {
      setInIdentification(true)
      for (let port of ports) {
        const total_steps = 11
        const identification = await getDeviceIdentification({
          port,
          callback: {
            onOpenPort: () => updateIdentifiedLog({
              port,
              step_label: "Abrindo a porta",
              step_index: 1,
              total_steps
            }),
            onPortOpened: () => updateIdentifiedLog({
              port,
              step_label: "Porta aberta",
              step_index: 2,
              total_steps
            }),
            onReg: () => updateIdentifiedLog({
              port,
              step_label: "REG",
              step_index: 3,
              total_steps
            }),
            onSms: () => updateIdentifiedLog({
              port,
              step_label: "SMS",
              step_index: 4,
              total_steps
            }),
            onEn: () => updateIdentifiedLog({
              port,
              step_label: "EN",
              step_index: 5,
              total_steps
            }),
            onImei: () => updateIdentifiedLog({
              port,
              step_label: "IMEI",
              step_index: 6,
              total_steps
            }),
            onIccid: () => updateIdentifiedLog({
              port,
              step_label: "ICCID",
              step_index: 7,
              total_steps
            }),
            onEt: () => updateIdentifiedLog({
              port,
              step_label: "ET",
              step_index: 8,
              total_steps
            }),
            onClosePort: () => updateIdentifiedLog({
              port,
              step_label: "Fechando a porta",
              step_index: 9,
              total_steps
            }),
            onFinished: () => updateIdentifiedLog({
              port,
              step_label: "Porta Fechada",
              step_index: 10,
              total_steps
            }),
          }
        })
        updateIdentifiedLog({
          port,
          step_label: "Processo Finalizado",
          step_index: 11,
          total_steps
        })
        const portHasDisconnected = disconnectedPorts.current.find(p => p === port)
        if (identification) {
          if (portHasDisconnected) {
            setIdentified(prev => {
              const updatedIdentified = prev.filter(el => el.port !== port);
              setIdentifiedLog(prevLog => prevLog.filter(el => el.port !== port));
              return updatedIdentified;
            });
          } else if (!portHasDisconnected) {
            setIdentified(prev => {
              const oldIdentifiers = prev.filter(el => el.port !== port);
              return oldIdentifiers.concat(identification)
            })
          }
        } else {
          setIdentified(prev => {
            const oldIdentifiers = prev.filter(el => el.port !== port);
            return oldIdentifiers.concat({ port, isIdentified: false })
          })
        }
      }
      setInIdentification(false)
    } catch (e) {
      console.error("[handleDeviceIdentification]", e)
    }
  }
  const handleDeviceConfiguration = async (devices: Identified[], desired_profile: DeviceProfile) => {
    try {
      setInConfiguration(true)
      const commands = parseCommands(desired_profile)
      for (let device of devices) {
        const { port, imei, iccid, et } = device
        if (!imei || !et) continue
        const total_steps = commands.length + 7;

        updateConfigurationLog({
          imei,
          step_index: 0,
          step_label: "Iniciando a configuração",
          total_steps
        })

        const configured_device = await configureDevice({
          port,
          commands,
          callback: {
            onOpenPort: () => updateConfigurationLog({
              imei,
              step_label: "Abrindo a porta",
              step_index: 1,
              total_steps
            }),
            onPortOpened: () => updateConfigurationLog({
              imei,
              step_label: "Porta aberta",
              step_index: 2,
              total_steps
            }),
            onSendCommand: (command, idx) => updateConfigurationLog({
              imei,
              step_label: command,
              step_index: 2 + idx,
              total_steps
            }),
            onClosePort: () => updateConfigurationLog({
              imei,
              step_label: "Fechando a porta",
              step_index: total_steps - 4,
              total_steps
            }),
            onFinished: () => updateConfigurationLog({
              imei,
              step_label: "Porta fechada",
              step_index: total_steps - 3,
              total_steps
            }),
          }
        });

        updateConfigurationLog({
          imei,
          step_label: "Requisitando configuração",
          step_index: total_steps - 2,
          total_steps
        })

        const { profile: actual_profile, native_profile } = await getDeviceProfile(port) ?? {};

        updateConfigurationLog({
          imei,
          step_label: "Checando as diferenças",
          step_index: total_steps - 1,
          total_steps
        })

        delete desired_profile?.password;
        const {
          isEqual: is_configured,
          difference: not_configured
        } = checkWithDifference(desired_profile, actual_profile)

        const id = crypto.randomUUID()

        const configuration_result = {
          id,
          port,
          imei,
          iccid,
          et,
          actual_profile: actual_profile ?? undefined,
          actual_native_profile: native_profile ?? undefined,
          desired_profile,
          is_configured,
          not_configured,
          metadata: configured_device,
          profile_id: profile?.id!,
          profile_name: profile?.name!
        }

        localStorage.setItem(`configuration_result_${id}`, JSON.stringify(configuration_result))
        updateConfigurationLog({
          imei,
          step_index: total_steps,
          step_label: "Processo finalizado",
          total_steps,
        })
        const portHasDisconnected = disconnectedPorts.current.find(p => p === port)
        if (portHasDisconnected) {
          setConfiguration(prev => {
            const _identified = identified.find(el => el.port === port);
            const updatedConfiguration = prev.filter(el => el.port !== port);
            setConfigurationLog(prevLog => prevLog.filter(el => el.imei !== _identified?.imei));
            return updatedConfiguration;
          });
        } else if (!portHasDisconnected) {
          setConfiguration(prev => prev.concat(configuration_result))
        }
        await createOneConfigurationLog(JSON.parse(JSON.stringify(configuration_result)))
      }
      setInConfiguration(false)
    } catch (e) {
      console.error("[handleDeviceConfiguration]", e)
    }
  }

  //util function
  const parseCommands = (config: IProfile["config"]) => {
    const configure_commands: string[] = [];
    Object.entries(config).forEach(([command, args]) => {
      const _command = E3Encoder.encoder({ command, args } as any);
      if (_command) {
        configure_commands.push(...(Array.isArray(_command) ? _command : [_command]));
      }
    });
    const initialize_commands = ["REG000000#", "SMS1", "EN"]
    const all_commands = initialize_commands.concat(configure_commands)
    return all_commands
  }
  const updateConfigurationLog = (input: {
    step_label: string,
    step_index: number,
    imei: string,
    total_steps: number,
  }) => {
    const { imei, total_steps, step_index, step_label } = input
    const percentage = Math.round((step_index / total_steps) * 100);
    setConfigurationLog(prev => {
      const rest = prev.filter(el => el.imei !== imei)
      const current = prev.find(el => el.imei === imei)
      const result = rest.concat({
        ...(current ?? { imei }),
        label: step_label,
        progress: percentage,
      })
      return result
    });
  }
  const updateIdentifiedLog = (input: {
    step_label: string,
    step_index: number,
    port: ISerialPort,
    total_steps: number,
  }) => {
    const { port, total_steps, step_index, step_label } = input
    const percentage = Math.round((step_index / total_steps) * 100);
    setIdentifiedLog(prev => {
      const rest = prev.filter(el => el.port !== port)
      const current = prev.find(el => el.port === port)
      const result = rest.concat({
        ...(current ?? { port }),
        label: step_label,
        progress: percentage,
      })
      return result
    });
  }


  // useEffect(() => {
  //   const newPorts = ports.filter(port => !previousPorts.current.includes(port));

  //   if (newPorts.length > 0) {
  //     handleDeviceIdentification(newPorts);
  //   }

  //   previousPorts.current = ports
  // }, [ports]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (inConfiguration) return
      handleDeviceIdentification(ports)
    }, 5000)
    return () => clearInterval(interval)
  }, [ports, inConfiguration])

  return {
    identified,
    requestPort,
    ports,
    getDeviceProfile,
    handleDeviceConfiguration,
    configuration,
    configurationLog,
    identifiedLog,
    inConfiguration,
    inIdentification
  }
}
