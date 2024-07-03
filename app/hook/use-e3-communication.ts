import { useEffect, useState, useRef } from "react";
import { useSerial } from "./use-serial";
import { ISerialPort } from "../lib/definitions/serial";
import { sleep } from "../lib/util/sleep";
import { E3 } from "../lib/parser/e3+";

type Identified = { port: ISerialPort, imei?: string, check?: string, iccid?: string }
type Data = { port: ISerialPort, message: string, timestamp: number }

export function useE3Communication() {
  const { ports, writeToPort, openPort, getReader, requestPort } = useSerial({
    handleConnection: () => { },
    handleDisconnection: (port) => {
      setIdentified(prev => prev.filter(el => el.port !== port));
      setLog(prev => prev.filter(el => el.port !== port));
    },
  });
  const [identified, setIdentified] = useState<Identified[]>([]);
  const [log, setLog] = useState<Data[]>([])

  const indentifierDevices = async (ports: ISerialPort[]) => {
    for (let port of ports) {
      if (!port.readable && !port.writable) {
        let reader: ReadableStreamDefaultReader<Uint8Array> | undefined
        try {
          await openPort(port);
          reader = await getReader(port);
          if (typeof reader !== "undefined") {
            const _reader = reader
            await writeToPort(port, "REG000000#")
            await sleep(500)
            await writeToPort(port, "SMS1")
            await sleep(500)
            await writeToPort(port, "EN")
            await sleep(500)
            await writeToPort(port, "IMEI")
            const imei = await readUntilCommand(_reader, "IMEI")
            await sleep(500)
            await writeToPort(port, "ICCID")
            const iccid = await readUntilCommand(_reader, "ICCID")
            await sleep(500)
            await writeToPort(port, "CHECK")
            const check = await readUntilCommand(_reader, "CHECK")
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
          await indentifierDevices([port])
        }
      }
    }
  }
  const readUntilCommand = async (reader: ReadableStreamDefaultReader<Uint8Array>, command: string) => {
    const decoder = new TextDecoder();
    let buffer = "";
    let foundCommandResponse = false;
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      const chunk = decoder.decode(value, { stream: true });
      buffer += chunk;

      let lines = buffer.split("\r\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (line.length > 0) {
          const timestamp = Date.now();
          if (line.includes(`SMS:${command}`)) {
            foundCommandResponse = true;
          } else if (foundCommandResponse) {
            return line;
          }
        }
      }
    }
  }

  useEffect(() => {
    indentifierDevices(ports)
  }, [ports]);

  return { log, identified, requestPort, ports };
}
