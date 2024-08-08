import { useEffect, useState, useRef, useCallback } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definition/serial"
import { sleep } from "../lib/util/sleep"
import { AutoTest, E34G } from "../lib/parser/E34G"
import { toast } from "./use-toast"
import { metadata } from "../layout"
import { boolean } from "zod"

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

interface Test {
  id: string
  port: ISerialPort;
  imei: string
  iccid?: string
  et: string
  is_successful: boolean;
  metadata: TestMetadata;
  auto_test_analysis: AutoTestAnalysis
}

interface AutoTestAnalysis {
  GPS: boolean
  GPSf: boolean
  GSM: boolean
  LTE: boolean
  IN1: boolean
  IN2: boolean
  OUT: boolean
  ACEL: boolean
  VCC: boolean
  IC: boolean
}

type TestMetadata = {
  port: ISerialPort
  init_time_configuration: number
  end_time_configuration: number
  commands_sent: {
    init_time_command: number
    end_time_command?: number
    request: string
    response?: string
  }[]
}


export function useE34GAutoTest() {
  const [identified, setIdentified] = useState<Identified[]>([])
  const [identifiedLog, setIdentifiedLog] = useState<IdentifiedLog[]>([])
  const [inIdentification, setInIdentification] = useState<boolean>(false)

  const [test, setTest] = useState<Test[]>([])
  const [inTest, setInTest] = useState<boolean>(false)

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
      const updatedIdentified = prev.filter(el => el.port !== port);
      setIdentifiedLog(prevLog => prevLog.filter(el => el.port !== port));
      return updatedIdentified;
    });
  }, [setIdentified])

  const handleSerialConnection = () => {
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

  const readDeviceResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>, timeout = 500) => {
    const decoder = new TextDecoder()
    let buffer = ""
    const timeoutPromise = new Promise<undefined>((resolve) =>
      setTimeout(() => resolve(undefined), timeout)
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
  const sendCommandWithRetries = async (port: ISerialPort, command: string, timeout?: number) => {
    let attempts = 0;
    const maxRetries = 3
    while (attempts < maxRetries) {
      await sleep(100)
      const reader = await getReader(port)
      if (!reader) return
      try {
        await writeToPort(port, command);
        const response = await readDeviceResponse(reader, timeout);
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

  const getDeviceIdentification = async (props: {
    port: ISerialPort,
  }, depth = 3): Promise<Identified | undefined> => {
    const { port } = props
    if (port.readable && port.writable) return
    if (depth <= 0) return undefined
    try {
      await openPort(port);

      await sendCommandWithRetries(port, "REG000000#");
      await sendCommandWithRetries(port, "SMS1");
      await sendCommandWithRetries(port, "EN");

      const imei = await sendCommandWithRetries(port, "IMEI");
      const iccid = await sendCommandWithRetries(port, "ICCID");
      const et = await sendCommandWithRetries(port, "ET");

      const isIdentified = imei !== undefined && iccid !== undefined && et !== undefined
      await closePort(port);
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
  const autoTest = async (input: {
    port: ISerialPort,
    commands: [string, number][],
  }): Promise<TestMetadata> => {
    const { port, commands } = input
    try {
      const commands_sent = []
      await openPort(port)
      const init_time_configuration = Date.now()
      for (let c = 0; c < commands.length; c++) {
        const [command, timeout] = commands[c]
        const init_time_command = Date.now()
        console.log('command: ', command)
        const response = await sendCommandWithRetries(port, command, timeout);
        console.log('response: ', response)
        const end_time_command = Date.now()
        commands_sent.push({
          response,
          request: command,
          init_time_command,
          end_time_command: response ? end_time_command : undefined
        })
      }
      const end_time_configuration = Date.now()
      await closePort(port)
      return {
        init_time_configuration,
        end_time_configuration,
        commands_sent,
        port
      }
    } catch (e) {
      console.error('ERROR [autoTest]', e);
      await closePort(port)
      return await autoTest({ port, commands })
    }
  }

  const handleDeviceIdentification = async (ports: ISerialPort[]) => {
    try {
      setInIdentification(true)
      for (let port of ports) {
        const identification = await getDeviceIdentification({
          port
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
  const handleDeviceAutoTest = async (devices: Identified[]) => {
    try {
      setInTest(true)
      for (let device of devices) {
        const { port, imei, iccid, et } = device
        if (!imei || !et) continue

        const commands: [string, number][] = [
          ["REG000000#", 500],
          ["SMS1", 500],
          ["EN", 500],
          ["AUTOTEST", 25000],
          ["AUTOTEST", 25000],
          ["AUTOTEST", 25000]
        ]
        const test_metadata = await autoTest({ port, commands })
        const id = crypto.randomUUID()

        const auto_test_parsed = test_metadata.commands_sent
          .map((c) => c.response !== undefined ? E34G.auto_test(c.response) : undefined)
          .filter(c => c !== undefined)

        const auto_test_analysis = autoTestAnalysis(auto_test_parsed)

        const result = {
          id,
          port,
          imei,
          iccid,
          et,
          metadata: test_metadata,
          is_successful: false,
          auto_test_analysis
        }



        const portHasDisconnected = disconnectedPorts.current.find(p => p === port)
        if (portHasDisconnected) {
          setTest(prev => {
            const updatedConfiguration = prev.filter(el => el.port !== port);
            return updatedConfiguration;
          });
        } else if (!portHasDisconnected) {
          setTest(prev => prev.concat(result))
        }
      }
      setInTest(false)
    } catch (e) {
      console.error("[handleDeviceAutoTest]", e)
    }
  }


  const autoTestAnalysis = (autoTest: AutoTest[]) => {
    return autoTest.reduce((acc, cur) => {

      acc["IC"] = /^\d{19,20}$/.test(cur["IC"])
      acc["GPS"] = cur["GPS"] === "OK" ? true : false
      acc["GPSf"] = cur["GPSf"] === "OK" ? true : false
      acc["GSM"] = cur["GSM"] === "OK" ? true : false
      acc["LTE"] = cur["LTE"] === "OK" ? true : false
      acc["IN1"] = cur["IN1"] === "OK" ? true : false
      acc["IN2"] = cur["IN2"] === "OK" ? true : false
      acc["OUT"] = cur["OUT"] === "OK" ? true : false
      acc["ACEL"] = cur["ACEL"] === "OK" ? true : false
      acc["VCC"] = cur["VCC"] === "OK" ? true : false

      return acc
    }, {} as AutoTestAnalysis)
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
    test,
    requestPort,
    ports,
    identifiedLog,
    inIdentification,
    handleDeviceAutoTest,
    inTest
  }
}
