import { useEffect, useState, useRef } from "react";
import { useSerial } from "./use-serial";
import { ISerialPort } from "../lib/definitions/serial";
import { sleep } from "../lib/util/sleep";

type Identified = { port: ISerialPort, imei?: string, check?: string, iccid?: string }
type Data = { port: ISerialPort, message: string, timestamp: number }
type Reader = { port: ISerialPort, reader: ReadableStreamDefaultReader<Uint8Array>, imei?: string }


export function useE3Communication() {
  const { ports, writeToPort, openPort, getReader, requestPort } = useSerial({
    handleConnection: () => { },
    handleDisconnection: (port) => {
      setDataForIdentifier(prev => prev.filter(el => el.port !== port));
      setIdentified(prev => prev.filter(el => el.port !== port));
      setLog(prev => prev.filter(el => el.port !== port));
    },
  });
  const [identified, setIdentified] = useState<Identified[]>([]);
  const identifiedRef = useRef(identified);
  const [dataForIdentifier, setDataForIdentifier] = useState<Data[]>([]);
  const [readers, setReaders] = useState<Reader[]>([])
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
            await sleep(200)
            await writeToPort(port, "SMS1")
            await sleep(200)
            await writeToPort(port, "EN")
            await sleep(200)
            await writeToPort(port, "IMEI")
            await sleep(200)
            await writeToPort(port, "ICCID")
            await sleep(200)
            await writeToPort(port, "CHECK")
            await sleep(200)
            await readFromPortUntilIdentifiedIsComplete(port, _reader); // Start reading from port
            const _identified = identifiedRef.current.find(el => el.port === port)
            setReaders((prev) => [...prev, { reader: _reader, port, imei: _identified?.imei }])
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
  const trackLog = async (readers: Reader[]) => {
    await Promise.all(readers.map(async (r) => {
      const { reader, port, imei } = r
      const decoder = new TextDecoder();
      let buffer = "";
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
            setLog(prev => [...prev, { port, message: line, timestamp, imei }]);
          }
        }
      }
    }))
  }
  const readFromPortUntilIdentifiedIsComplete = async (port: ISerialPort, reader: ReadableStreamDefaultReader<Uint8Array>) => {
    const decoder = new TextDecoder();
    let buffer = "";

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
          setDataForIdentifier(prev => [...prev, { port, message: line, timestamp }]);
        }
      }

      const allIdentifiedComplete =
        identifiedRef.current.length !== 0 &&
        identifiedRef.current.every(port => port.imei && port.check && port.iccid);

      if (allIdentifiedComplete) {
        break;
      }
    }
  }
  const updateIdentified = (dataForIdentifier: Data[], identified: Identified[]) => {
    const allIdentifiedComplete =
      identified.length !== 0 &&
      identified.every(port => port.imei && port.check && port.iccid);
    if (!allIdentifiedComplete) {
      const newIdentified = [...identified];
      let identifiedUpdated = false;

      dataForIdentifier.forEach((d, index) => {
        if (d.message.includes("SMS:")) {
          const nextLine = dataForIdentifier[index + 1];
          if (nextLine && nextLine.port === d.port) {
            let existingPortData = newIdentified.find(el => el.port === d.port);
            if (!existingPortData) {
              existingPortData = { port: d.port };
              newIdentified.push(existingPortData);
            }

            if (d.message.includes("IMEI") && existingPortData.imei !== nextLine.message) {
              existingPortData.imei = nextLine.message.trim().split("IMEI=")[1];
              identifiedUpdated = true;
            }
            if (d.message.includes("ICCID") && existingPortData.iccid !== nextLine.message) {
              existingPortData.iccid = nextLine.message.trim().split("ICCID=")[1];
              identifiedUpdated = true;
            }
            if (d.message.includes("CHECK") && existingPortData.check !== nextLine.message) {
              existingPortData.check = nextLine.message;
              identifiedUpdated = true;
            }
          }
        }
      });

      if (identifiedUpdated) {
        setIdentified(newIdentified);
      }
    }
  };

  useEffect(() => {
    identifiedRef.current = identified;
  }, [identified]);

  useEffect(() => {
    console.log('ports.length', ports.length)
    indentifierDevices(ports)
  }, [ports]);

  useEffect(() => {
    updateIdentified(dataForIdentifier, identified);
  }, [dataForIdentifier, identified]);

  // useEffect(() => {
  //   trackLog(readers)
  // }, [readers])

  return { log, identified, requestPort, ports };
}
