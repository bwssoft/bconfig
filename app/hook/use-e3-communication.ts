import { useEffect, useState, useRef } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definitions/serial"
import { sleep } from "../lib/util/sleep"
import { E3 } from "../lib/parser/e3+"

type Identified = { port: ISerialPort, imei?: string, check?: string, iccid?: string }

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
            let imei, iccid, check
            while (!imei || !iccid || !check) {
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
            }
            setIdentified(prev => [
              ...prev,
              {
                port,
                iccid: iccid ? E3.iccid(iccid) : undefined,
                imei: imei ? E3.imei(imei) : undefined,
                check
              }
            ])
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
