import { useEffect, useState, useRef, useCallback } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definition/serial"
import { sleep } from "../lib/util/sleep"
import { AutoTest, E34G } from "../lib/parser/E34G"
import { toast } from "./use-toast"

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

interface TestLog {
  imei: string
  label: string
  progress: number
}


export function useE34GAutoTest() {
  const [identified, setIdentified] = useState<Identified[]>([])
  const [identifiedLog, setIdentifiedLog] = useState<IdentifiedLog[]>([])
  const [inIdentification, setInIdentification] = useState<boolean>(false)

  const [test, setTest] = useState<Test[]>([])
  const [testLog, setTestLog] = useState<TestLog[]>([])
  const [inTest, setInTest] = useState<boolean>(false)

  const previousPorts = useRef<ISerialPort[]>([])
  const disconnectedPorts = useRef<ISerialPort[]>([])

  const handleSerialDisconnection = useCallback((port: ISerialPort) => {
    toast({
      title: "Disconnected!",
      description: "Serial port disconnected!",
      variant: "success",
      className: "destructive group border bg-stone-400 border-stone-300 text-white"
    })
    disconnectedPorts.current.push(port)
    setIdentified(prev => {
      const _identified = prev.find(el => el.port === port);
      const updatedIdentified = prev.filter(el => el.port !== port);
      setIdentifiedLog(prevLog => prevLog.filter(el => el.port !== port));
      setTestLog(prevLog => prevLog.filter(el => el.imei !== _identified?.imei));
      setTest(prevConfig => prevConfig.filter(el => el.imei !== _identified?.imei));
      return updatedIdentified;
    });
  }, [setIdentified])

  const handleSerialConnection = () => {
    toast({
      title: "Connected!",
      description: "Serial port connected!",
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
      await sendCommandWithRetries(port, "REG000000#");
      callback.onSms()
      await sendCommandWithRetries(port, "SMS1");
      callback.onEn()
      await sendCommandWithRetries(port, "EN");

      callback.onImei()
      let imei = await sendCommandWithRetries(port, "IMEI");
      callback.onIccid()
      let iccid = await sendCommandWithRetries(port, "ICCID");
      callback.onEt()
      let et = await sendCommandWithRetries(port, "ET");
      //   attempts++
      // }

      iccid = iccid ? E34G.iccid(iccid) : undefined
      imei = imei ? E34G.imei(imei) : undefined
      et = et ? E34G.et(et) : undefined

      const isIdentified = imei !== undefined && iccid !== undefined && et !== undefined

      callback.onClosePort()
      await closePort(port);
      callback.onFinished()

      return {
        port,
        iccid,
        imei,
        et,
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
    callback: {
      onOpenPort: () => void
      onPortOpened: () => void
      onSendCommand: (command: string, idx: number) => void
      onClosePort: () => void
      onFinished: () => void
    }
  }): Promise<TestMetadata> => {
    const { port, commands, callback } = input
    try {
      const commands_sent = []
      callback.onOpenPort()
      await openPort(port)
      callback.onPortOpened()
      const init_time_configuration = Date.now()
      for (let c = 0; c < commands.length; c++) {
        const [command, timeout] = commands[c]
        const init_time_command = Date.now()
        callback.onSendCommand(command, c)
        const response = await sendCommandWithRetries(port, command, timeout);
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
      console.error('ERROR [autoTest]', e);
      await closePort(port)
      return await autoTest({ port, commands, callback })
    }
  }

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
              step_label: "Opening serial port",
              step_index: 1,
              total_steps
            }),
            onPortOpened: () => updateIdentifiedLog({
              port,
              step_label: "Serial port opened",
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
              step_label: "Closing serial port",
              step_index: 9,
              total_steps
            }),
            onFinished: () => updateIdentifiedLog({
              port,
              step_label: "Serial port closed",
              step_index: 10,
              total_steps
            }),
          }
        })
        updateIdentifiedLog({
          port,
          step_label: "Process Finished",
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

        const total_steps = commands.length + 6;

        updateTestLog({
          imei,
          step_index: 0,
          step_label: "Auto Test initializing",
          total_steps
        })

        const test_metadata = await autoTest({
          port, commands, callback: {
            onOpenPort: () => updateTestLog({
              imei,
              step_label: "Opening serial port",
              step_index: 1,
              total_steps
            }),
            onPortOpened: () => updateTestLog({
              imei,
              step_label: "Serial port opened",
              step_index: 2,
              total_steps
            }),
            onSendCommand: (command, idx) => updateTestLog({
              imei,
              step_label: command,
              step_index: 2 + idx,
              total_steps
            }),
            onClosePort: () => updateTestLog({
              imei,
              step_label: "Closing serial port",
              step_index: total_steps - 3,
              total_steps
            }),
            onFinished: () => updateTestLog({
              imei,
              step_label: "Serial port closed",
              step_index: total_steps - 2,
              total_steps
            }),
          }
        })
        const id = crypto.randomUUID()

        const auto_test_parsed = test_metadata.commands_sent
          .map((c) => c.response !== undefined ? E34G.auto_test(c.response) : undefined)
          .filter(c => c !== undefined)

        updateTestLog({
          imei,
          step_index: total_steps - 1,
          step_label: "Analyzing result",
          total_steps,
        })

        // @ts-ignore
        const auto_test_analysis = autoTestAnalysis(auto_test_parsed)

        updateTestLog({
          imei,
          step_index: total_steps,
          step_label: "Process Finished",
          total_steps,
        })

        const result = {
          id,
          port,
          imei,
          iccid,
          et,
          metadata: test_metadata,
          is_successful: Object.values(auto_test_analysis).every(el => el === true),
          auto_test_analysis
        }

        const portHasDisconnected = disconnectedPorts.current.find(p => p === port)
        if (portHasDisconnected) {
          setTest(prev => {
            const updatedConfiguration = prev.filter(el => el.port !== port);
            return updatedConfiguration;
          });
        } else if (!portHasDisconnected) {
          setTest(prev => {
            const old = prev.filter(el => el.imei !== imei);
            return old.concat(result)
          })
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
  const updateTestLog = (input: {
    step_label: string,
    step_index: number,
    imei: string,
    total_steps: number,
  }) => {
    const { imei, total_steps, step_index, step_label } = input
    const percentage = Math.round((step_index / total_steps) * 100);
    setTestLog(prev => {
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
    inTest,
    testLog
  }
}
