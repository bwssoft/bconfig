import { useEffect, useState, useRef } from "react"
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

export function useE3Communication() {
  const { ports, writeToPort, openPort, getReader, requestPort } = useSerial({
    handleDisconnection: (port) => {
      setIdentified(prev => prev.filter(el => el.port !== port))
    }
  })
  const [identified, setIdentified] = useState<Identified[]>([])

  const getDeviceInfo = async (ports: ISerialPort[]) => {
    await Promise.all(ports.map(async port => {
      if (!port.readable && !port.writable) {
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
              await sleep(500)
              await writeToPort(port, "SMS1")
              await sleep(500)
              await writeToPort(port, "EN")
              await sleep(500)

              if (!imei) {
                await writeToPort(port, "IMEI")
                imei = await readDeviceResponse(_reader, "IMEI")
              }
              await sleep(500)
              if (!iccid) {
                await writeToPort(port, "ICCID")
                iccid = await readDeviceResponse(_reader, "ICCID")
              }
              await sleep(500)
              if (!check) {
                await writeToPort(port, "CHECK")
                check = await readDeviceResponse(_reader, "CHECK")
              }
              await sleep(500)
              if (!cxip) {
                await writeToPort(port, "CXIP")
                cxip = await readDeviceResponse(_reader, "CXIP")
              }
              await sleep(500)
              if (!dns) {
                await writeToPort(port, "DNS")
                dns = await readDeviceResponse(_reader, "DNS")
              }
              await sleep(500)
              if (!et) {
                await writeToPort(port, "ET")
                et = await readDeviceResponse(_reader, "ET")
              }
              await sleep(500)
              if (!status) {
                await writeToPort(port, "STATUS")
                status = await readDeviceResponse(_reader, "STATUS")
              }
            }
            setIdentified(prev => {
              const _check = check ? E3.check(check) : undefined
              console.log('check', check)
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
                    economy_mode: _check?.economy_mode ?? undefined
                  },
                }
              ]
            })
          }
        } catch (e) {
          console.error("error on init", e)
          reader?.releaseLock()
          await port.close()
          await getDeviceInfo([port])
        }
      }
    }))
  }

  const readDeviceResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>, command: string) => {
    const decoder = new TextDecoder()
    let buffer = ""
    let foundCommandResponse = false
    while (true) {
      const { value, done } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value, { stream: true })
      buffer += chunk

      let lines = buffer.split("\r\n")
      buffer = lines.pop() || ""
      for (const line of lines) {
        if (line.length > 0) {
          const timestamp = Date.now()
          if (line.includes(`SMS:${command}`)) {
            foundCommandResponse = true
          } else if (foundCommandResponse) {
            return line
          }
        }
      }
    }
  }

  useEffect(() => {
    getDeviceInfo(ports)
  }, [ports])

  return { identified, requestPort, ports }
}
