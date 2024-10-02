import { useEffect, useState, useRef, useCallback } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definition/serial"
import { sleep } from "../lib/util/sleep"
import { E34G } from "../lib/parser/E34G"
import { toast } from "./use-toast"

interface Identified {
  isIdentified: boolean
  port: ISerialPort
  imei?: string
  iccid?: string
  et?: string
}

export interface Configuration {
  id: string
  port: ISerialPort;
  previous_imei: string
  desired_imei: string
  iccid?: string
  et: string
  is_configured: boolean;
  metadata: ConfigurationMetadata;
}

type ConfigurationMetadata = {
  port: ISerialPort
  init_time_configuration: number
  end_time_configuration: number
  // commands_sent: {
  //   init_time_command: number
  //   end_time_command?: number
  //   request: string
  //   response?: string
  // }[]
}

type DeviceResponse = string | undefined

interface IdentifiedLog {
  port: ISerialPort
  label: string
  progress: number
}
interface ConfigurationLog {
  imei: string
  label: string
  progress: number
}

export function useE34GImeiWriter() {
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
      setConfiguration(prevConfig => prevConfig.filter(el => el.previous_imei !== _identified?.imei));
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
  const readDeviceResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder()
    let buffer = ""
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
            return line;
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
        const response = await readDeviceResponse(reader);
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
      callback.onImei()
      const imei = await sendCommandWithRetries(port, "IMEI");
      callback.onIccid()
      const iccid = await sendCommandWithRetries(port, "ICCID");
      callback.onEt()
      const et = await sendCommandWithRetries(port, "ET");
      const isIdentified = imei !== undefined && iccid !== undefined && et !== undefined
      callback.onClosePort()
      await closePort(port);
      callback.onFinished()
      return {
        port,
        iccid: iccid ? E34G.iccid(iccid) : undefined,
        imei: imei ? E34G.imei(imei) : undefined,
        et: et ? E34G.et(et) : undefined,
        isIdentified
      }
    } catch (e) {
      console.error("ERROR [getDeviceIdentification]", e);
      await closePort(port);
      return await getDeviceIdentification(props);
    }
  };
  const getDeviceSerial = async (port: ISerialPort, depth = 3): Promise<{ serial: string | undefined } | undefined> => {
    if (port.readable && port.writable) return
    if (depth <= 0) return undefined
    try {
      await openPort(port);
      let serial: DeviceResponse
      if (!serial) serial = await sendCommandWithRetries(port, "IMEI");
      await closePort(port);
      return {
        serial: serial ? E34G.imei(serial) : undefined
      }
    } catch (e) {
      console.error("ERROR [getDeviceSerial]", e);
      await closePort(port);
      return await getDeviceSerial(port, depth - 1);
    }
  };
  const writeImei = async (input: {
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
        // commands_sent,
        port
      }
    } catch (e) {
      console.error('ERROR [writeImei]', e);
      await closePort(port)
      return await writeImei({ port, commands, callback })
    }
  }


  //
  const handleDeviceIdentification = async (ports: ISerialPort[]) => {
    try {
      setInIdentification(true)
      for (let port of ports) {
        const total_steps = 8
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
            onImei: () => updateIdentifiedLog({
              port,
              step_label: "IMEI",
              step_index: 3,
              total_steps
            }),
            onIccid: () => updateIdentifiedLog({
              port,
              step_label: "ICCID",
              step_index: 4,
              total_steps
            }),
            onEt: () => updateIdentifiedLog({
              port,
              step_label: "ET",
              step_index: 5,
              total_steps
            }),
            onClosePort: () => updateIdentifiedLog({
              port,
              step_label: "Fechando a porta",
              step_index: 6,
              total_steps
            }),
            onFinished: () => updateIdentifiedLog({
              port,
              step_label: "Porta Fechada",
              step_index: 7,
              total_steps
            }),
          }
        })
        updateIdentifiedLog({
          port,
          step_label: "Processo Finalizado",
          step_index: 8,
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
            setIdentified([identification])
          }
        }
      }
      setInIdentification(false)
    } catch (e) {
      console.error("[handleDeviceIdentification]", e)
    }
  }
  const handleDeviceConfiguration = async (device: Identified, desired_imei: string) => {
    try {
      setInConfiguration(true)
      const commands = parseCommands(desired_imei)
      const { port, imei, iccid, et } = device
      if (!imei || !et) return
      const total_steps = commands.length + 7;

      updateConfigurationLog({
        imei,
        step_index: 0,
        step_label: "Iniciando a configuração",
        total_steps
      })

      const configured_device = await writeImei({
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

      await sleep(800)

      const serialResponse = await getDeviceSerial(port);

      updateConfigurationLog({
        imei,
        step_label: "Checando as diferenças",
        step_index: total_steps - 1,
        total_steps
      })

      const is_equal = serialResponse ? serialResponse.serial === desired_imei : false

      const id = crypto.randomUUID()

      const configuration_result = {
        id,
        port,
        previous_imei: imei,
        desired_imei: desired_imei,
        iccid,
        et,
        is_configured: is_equal,
        metadata: configured_device,
      }

      localStorage.setItem(`write_imei_result_${id}`, JSON.stringify(configuration_result))
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
      setInConfiguration(false)
    } catch (e) {
      console.error("[handleDeviceConfiguration]", e)
    }
  }

  //util function
  const parseCommands = (serial: string) => {
    const configure_commands: string[] = [];
    const initialize_commands = [`13041SETSN,${serial}`]
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


  useEffect(() => {
    const newPorts = ports.filter(port => !previousPorts.current.includes(port));

    if (newPorts.length > 0) {
      handleDeviceIdentification(newPorts);
    }

    previousPorts.current = ports
  }, [ports]);



  return {
    identified,
    requestPort,
    ports,
    getDeviceSerial,
    handleDeviceConfiguration,
    configuration,
    configurationLog,
    identifiedLog,
    inConfiguration,
    inIdentification,
    handleDeviceIdentification,
  }
}
