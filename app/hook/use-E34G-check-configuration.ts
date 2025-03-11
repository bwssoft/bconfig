import { useEffect, useState, useRef, useCallback } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definition/serial"
import { sleep } from "../lib/util/sleep"
import { ConfigurationMetadata, DeviceNativeProfile, DeviceProfile, IConfigurationLog, IProfile } from "../lib/definition"
import { toast } from "./use-toast"
import { E34G } from "../lib/parser/E34G"
import { findOneConfigurationLog, updateOneConfigurationLog } from "../lib/action"
import { checkWithDifference } from "../lib/util"
import { useRouter } from "next/navigation"

interface Identified {
  isIdentified: boolean
  port: ISerialPort
  imei?: string
  iccid?: string
  et?: string
  double_check: boolean
}

interface IdentifiedLog {
  port: ISerialPort
  label: string
  progress: number
}

interface CheckConfiguration extends Identified {
  double_check: boolean
}

type DeviceResponse = string | undefined

export function useE34GCheckConfiguration() {
  const [showModal, setShowModal] = useState<boolean>(false)
  const [checkResult, setCheckResult] = useState<boolean>(false)
  const [lastConfigurationLog, setlastConfigurationLog] = useState<IConfigurationLog>()

  const [identified, setIdentified] = useState<Identified[]>([])
  const [identifiedLog, setIdentifiedLog] = useState<IdentifiedLog[]>([])
  const [inIdentification, setInIdentification] = useState<boolean>(false)

  const [disconnection, setDisconnection] = useState<Identified[]>([])

  const [checkConfiguration, setCheckConfiguration] = useState<CheckConfiguration[]>([])
  const [inChecking, setInChecking] = useState<boolean>(false)

  const previousPorts = useRef<ISerialPort[]>([])
  const disconnectedPorts = useRef<ISerialPort[]>([])

  const handleSerialDisconnection = useCallback((port: ISerialPort) => {
    toast({
      title: "Desconexão!",
      description: "Equipamento desconectado!",
      variant: "default",
      className: "destructive group border bg-stone-400 border-stone-300 text-white"
    })
    disconnectedPorts.current.push(port)
    setDisconnection(identified.filter(el => el.port === port))
  }, [identified])

  const handleSerialConnection = (port: ISerialPort) => {
    toast({
      title: "Conexão!",
      description: "Equipamento conectado!",
      variant: "success",
    })
  }

  const { ports, writeToPort, openPort, getReader, requestPort, closePort, forgetPort } = useSerial({
    handleDisconnection: handleSerialDisconnection,
    handleConnection: handleSerialConnection
  })

  //
  const readDeviceResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder()
    let buffer = ""
    const timeoutPromise = new Promise<undefined>((resolve) =>
      setTimeout(() => resolve(undefined), 3000)
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
    const maxRetries = 3;
    while (attempts < maxRetries) {
      await sleep(100);
      const reader = await getReader(port);
      if (!reader) return;
      try {
        console.log("sending -> ", command);
        await writeToPort(port, command);
        const response = await readDeviceResponse(reader);
        console.log("response -> ", response);
        await reader.cancel();
        reader.releaseLock();
        if (response) return response;
      } catch (error) {
        await reader.cancel();
        reader.releaseLock();
        console.error(
          `ERROR [sendCommandWithRetries] ${
            attempts + 1
          } for command ${command}:`,
          error
        );
      }
      attempts++;
    }
  };

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
      // let attempts = 0
      // const max_retries = 3
      // Main loop to gather device info
      // while (attempts < max_retries && (!imei || !iccid || !et)) {
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
        iccid: iccid ? E34G.iccid(iccid) : undefined,
        imei: imei ? E34G.imei(imei) : undefined,
        et: et ? E34G.et(et) : undefined,
        isIdentified,
        double_check: false
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
      let attempts = 0
      const max_retries = 5
      let check: DeviceResponse, cxip: DeviceResponse, status: DeviceResponse
      while (attempts < max_retries && (!check || !cxip || !status)) {
        if (!check) check = await sendCommandWithRetries(port, "CHECK");
        if (!cxip) cxip = await sendCommandWithRetries(port, "CXIP");
        if (!status) status = await sendCommandWithRetries(port, "STATUS");
        attempts++
      }
      await closePort(port);
      const _check = check ? E34G.check(check) : undefined;
      const _status = status ? E34G.status(status) : undefined;
      return {
        profile: {
          ip: cxip ? E34G.ip(cxip) : undefined,
          dns: cxip ? E34G.dns(cxip) : undefined,
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
          led: _check?.led ?? undefined,
          max_speed: _check?.max_speed ?? undefined,
          virtual_ignition: _check?.virtual_ignition ?? undefined,
          virtual_ignition_by_voltage: _check?.virtual_ignition_by_voltage ?? undefined,
          virtual_ignition_by_movement: _check?.virtual_ignition_by_movement ?? undefined,
          communication_type: _check?.communication_type ?? undefined,
          protocol_type: _check?.protocol_type ?? undefined,
          anti_theft: _check?.anti_theft ?? undefined,
          jammer_detection: _check?.jammer_detection ?? undefined,
          angle_adjustment: _check?.angle_adjustment ?? undefined,
          lock_type_progression: _check?.lock_type_progression ?? undefined,
          ignition_by_voltage: _check?.ignition_by_voltage ?? undefined,
          input_1: _check?.input_1 ?? undefined,
          input_2: _check?.input_2 ?? undefined,
          sensitivity_adjustment: _check?.sensitivity_adjustment ?? undefined,
          ack: _check?.ack ?? undefined,
          horimeter: _status?.["HR"] ? E34G.horimeter(_status?.["HR"]) : undefined
        },
        native_profile: {
          cxip,
          check,
          status
        }
      }
    } catch (e) {
      console.error("ERROR [getDeviceProfile]", e);
      await closePort(port);
      return await getDeviceProfile(port, depth - 1);
    }
  };
  const waitDeviceBoot = async (): Promise<void> => {
    await sleep(20000)
  };

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
        if(identified.find(el => el.imei === identification?.imei) && identification){
          // if(!identification.iccid) {
          //   toast({
          //     title: "Desconecte e insira o SIMCard!",
          //     description: "Equipamento deve ser desconectado e o SIMCard deve ser inserido!",
          //     variant: "default",
          //     className: "destructive group border bg-cyan-400 border-cyan-300 text-white"
          //   })
          //   continue
          // }
          await handleDeviceCheckConfiguration([identification])
          continue
        }
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
            setIdentified(prev => {
              const oldIdentifiers = prev.filter(el => el.port !== port);
              return oldIdentifiers.concat(identification)
            })
            toast({
              title: "Desconecte!",
              description: "Equipamento deve ser desconectado!",
              variant: "default",
              className: "destructive group border bg-yellow-400 border-yellow-300 text-white"
            })
          }
        } else {
          setIdentified(prev => {
            const oldIdentifiers = prev.filter(el => el.port !== port);
            return oldIdentifiers.concat({ port, isIdentified: false, double_check: false })
          })
        }
      }
      setInIdentification(false)
    } catch (e) {
      console.error("[handleDeviceIdentification]", e)
    }
  }

  //
  const handleDeviceCheckConfiguration = async (identifieds: Identified[]) => {
    try {
      setInChecking(true)
      for (let identified of identifieds) {
        await waitDeviceBoot()
        const port = identified.port
        const total_steps = 8
        const _identified = await getDeviceIdentification({
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
        if(!_identified) continue

        const last_configuration_log = await findOneConfigurationLog(
          { imei: identified.imei }, 
          {
            projection: { _id: 0 }, 
            sort: { _id: -1 }
          }
        )
        if(!last_configuration_log) continue
        setlastConfigurationLog(last_configuration_log)
        const { profile: actual_profile, native_profile } = await getDeviceProfile(_identified.port) ?? {};
        
        delete actual_profile?.horimeter
        delete actual_profile?.odometer
        
        delete last_configuration_log?.actual_profile?.odometer
        delete last_configuration_log?.actual_profile?.horimeter

        const { isEqual, difference } = checkWithDifference(actual_profile, last_configuration_log?.actual_profile)
        if(isEqual){
          await updateOneConfigurationLog({id: last_configuration_log.id}, {
            ...last_configuration_log, 
            iccid: _identified.iccid, 
            actual_native_profile: native_profile,
            actual_profile,
            has_double_check: true
          })
          setCheckConfiguration(prev => {
            const old = prev.filter(el => el.imei !== _identified.imei)
            const current = prev.find(el => el.imei === _identified.imei)
            if(!current) return old.concat({ ..._identified, double_check: isEqual })
            return old.concat({ ..._identified, double_check: isEqual })
          })
          setCheckResult(true)
          setShowModal(true)          
        }else{
          setCheckResult(false)
          setShowModal(true)          
        }
      }
      setInChecking(false)
    } catch (e) {
      console.error("[handleDeviceCheckConfiguration]", e)
    }
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
  }, [ports])

  return {
    identified,
    requestPort,
    ports,
    getDeviceProfile,
    identifiedLog,
    inIdentification,
    checkConfiguration,
    disconnection,
    inChecking,
    showModal,
    setShowModal,
    checkResult,
    lastConfigurationLog
  }
}
