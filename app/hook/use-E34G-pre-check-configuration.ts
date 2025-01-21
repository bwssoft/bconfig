import { useEffect, useState, useRef, useCallback } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definition/serial"
import { sleep } from "../lib/util/sleep"
import { toast } from "./use-toast"
import { E34G } from "../lib/parser/E34G"
import { useRouter } from "next/navigation"

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

type DeviceResponse = string | undefined

export function useE34GPreCheckConfiguration() {
  const [identified, setIdentified] = useState<Identified[]>([])
  const [identifiedLog, setIdentifiedLog] = useState<IdentifiedLog[]>([])
  const [inIdentification, setInIdentification] = useState<boolean>(false)
  
  const previousPorts = useRef<ISerialPort[]>([])
  const disconnectedPorts = useRef<ISerialPort[]>([])

  const router = useRouter()

  const handleSerialDisconnection = useCallback((port: ISerialPort) => {
    toast({
      title: "Desconexão!",
      description: "Equipamento desconectado!",
      variant: "success",
      className: "destructive group border bg-stone-400 border-stone-300 text-white"
    })
    disconnectedPorts.current.push(port)
    setIdentified(prev => {
      const updatedIdentified = prev.filter(el => el.port !== port);
      setIdentifiedLog(prevLog => prevLog.filter(el => el.port !== port));
      return updatedIdentified;
    });
    router.push("/check/E3+4G")
  }, [setIdentified])

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
        isIdentified
      }
    } catch (e) {
      console.error("ERROR [getDeviceIdentification]", e);
      await closePort(port);
      return await getDeviceIdentification(props);
    }
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
      toast({
        title: "Desconecte o equipamento!",
        description: "É necessário desconectar o equipamento para prosseguir",
        variant: "success",
        className: "destructive group border bg-yellow-400 border-yellow-300 text-white"
      })
    }

    previousPorts.current = ports
  }, [ports]);

  return {
    identified,
    requestPort,
    ports,
    identifiedLog,
    inIdentification
  }
}
