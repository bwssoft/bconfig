import { useEffect, useState, useRef, useCallback } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definitions/serial"
import { sleep } from "../lib/util/sleep"
import { E3 } from "../lib/parser/e3+"

type Identified = {
  port: ISerialPort,
  imei?: string,
  iccid?: string,
  initialConfig?: {
    check?: string
    cxip?: string
    et?: string
    status?: string
  }
  config?: {
    ip: any
  }
}

type Command = {
  port: ISerialPort
  answer?: string
  command: string
}

export function useE3Communication() {
  const { ports, writeToPort, openPort, getReader, requestPort, closePort } = useSerial({
    handleDisconnection: (port) => {
      setIdentified(prev => prev.filter(el => el.port !== port))
    }
  })
  const [identified, setIdentified] = useState<Identified[]>([])
  const [commands, setCommands] = useState<Command[]>([])

  const getDeviceInfo = async (ports: ISerialPort[]) => {
    for (let port of ports) {
      if (!port.readable && !port.writable && !identified.find(el => el.port === port)) {
        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
        try {
          await openPort(port)
          reader = await getReader(port)
          if (typeof reader !== "undefined") {
            const _reader = reader
            let imei, iccid, check, cxip, dns;
            let et, status
            while (!imei || !iccid || !check || !cxip || !dns || !et || !status) {
              await writeToPort(port, "REG000000#")
              await sleep(100)
              await writeToPort(port, "SMS1")
              await sleep(100)
              await writeToPort(port, "EN")
              await sleep(100)

              if (!imei) {
                await writeToPort(port, "IMEI")
                imei = await readDeviceResponse(_reader, "IMEI")
              }
              await sleep(100)
              if (!iccid) {
                await writeToPort(port, "ICCID")
                iccid = await readDeviceResponse(_reader, "ICCID")
              }
              await sleep(100)
              if (!check) {
                await writeToPort(port, "CHECK")
                check = await readDeviceResponse(_reader, "CHECK")
              }
              await sleep(100)
              if (!cxip) {
                await writeToPort(port, "CXIP")
                cxip = await readDeviceResponse(_reader, "CXIP")
              }
              await sleep(100)
              if (!dns) {
                await writeToPort(port, "DNS")
                dns = await readDeviceResponse(_reader, "DNS")
              }
              await sleep(100)
              if (!et) {
                await writeToPort(port, "ET")
                et = await readDeviceResponse(_reader, "ET")
              }
              await sleep(100)
              if (!status) {
                await writeToPort(port, "STATUS")
                status = await readDeviceResponse(_reader, "STATUS")
              }
            }
            setIdentified(prev => {
              const _check = check ? E3.check(check) : undefined
              return [
                ...prev,
                {
                  port,
                  iccid: iccid ? E3.iccid(iccid) : undefined,
                  imei: imei ? E3.imei(imei) : undefined,
                  initialConfig: {
                    check: check ?? undefined,
                    cxip: cxip ?? undefined,
                    et: et ?? undefined,
                    status: status ?? undefined,
                  },
                  config: {
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
                  },
                }
              ]
            })
          }
          reader?.releaseLock()
          await closePort(port)
        } catch (e) {
          console.error("error on init", e)
          if (reader) {
            reader.releaseLock()
          }
          await closePort(port)
          await getDeviceInfo([port])
        }
      }
    }
  }

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

  const sendCommandWithRetries = useCallback(
    async (port: ISerialPort, command: string, maxRetries = 3) => {
      let attempts = 0;
      while (attempts < maxRetries) {
        await sleep(100)
        const reader = await getReader(port)
        if (!reader) return
        try {
          await writeToPort(port, command);
          const result = await readDeviceResponse(reader, command);
          await reader?.cancel()
          reader?.releaseLock()
          if (result) return result
        } catch (error) {
          if (reader) {
            await reader?.cancel()
            reader?.releaseLock()
          }
          console.error(`Error on attempt ${attempts + 1} for command ${command}:`, error);
        }
        attempts++;
      }
    },
    [getReader, writeToPort]
  )

  const sendCommands = useCallback(
    async (commands: string[]) => {
      for (let port of ports) {
        try {
          setCommands(prev => prev.filter(el => el.port !== port))
          await openPort(port)
          for (let command of commands) {
            const answer = await sendCommandWithRetries(port, command);
            setCommands(prev => [...prev, { answer, port, command }])
          }
          await closePort(port)
        } catch (e) {
          console.error('ERROR [sendCommands]', e);
          await closePort(port)
          await sendCommands(commands)
        }
      }
    },
    [closePort, openPort, ports, sendCommandWithRetries]
  );

  useEffect(() => {
    getDeviceInfo(ports)
  }, [ports, identified])

  return { identified, requestPort, ports, sendCommands, commands }
}
