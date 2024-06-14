import { useEffect, useState } from "react";
import { INavigator, ISerialPort } from "../lib/definitions/serial";

export const useSerial = () => {
  /*
    Esse state serve para armazenar as portas disponiveis para utilização.
  */
  const [ports, setPorts] = useState<{ port: ISerialPort, open: boolean }[]>([]);
  /*
    Essa const serve para armazenar os readers das portas para posteriormente poder fechar mesmo que o reader esteja aberto.
  */
  const portReaders = new Map<ISerialPort, ReadableStreamDefaultReader<Uint8Array>>()


  useEffect(() => {
    if (typeof window !== "undefined" && "serial" in navigator) {
      const _navigator = navigator as INavigator

      _navigator.serial.getPorts().then((ports) => {
        setPorts(ports.map(port => ({
          port,
          open: (port.readable && port.writable) ? true : false
        })));
      });

      const handleConnect = (e: Event) => {
        const target = e.target as ISerialPort | null
        if (!target) return
        const data = {
          port: target,
          open: (target.readable && target.writable) ? true : false
        }
        setPorts((prevPorts) => [...prevPorts, data]);
      };

      const handleDisconnect = (e: Event) => {
        const target = e.target as ISerialPort | null
        if (!target) return
        setPorts((prevPorts) => prevPorts.filter((p) => p.port !== target));
      };

      _navigator.serial.addEventListener("connect", handleConnect);
      _navigator.serial.addEventListener("disconnect", handleDisconnect);

      return () => {
        _navigator.serial.removeEventListener("connect", handleConnect);
        _navigator.serial.removeEventListener("disconnect", handleDisconnect);
      };
    }
  }, []);

  //Serial
  const requestPort = async () => {
    try {
      const port = await (navigator as INavigator).serial.requestPort();
      const data = { port, open: (port.readable && port.writable) ? true : false }
      setPorts((prevPorts) => [...prevPorts, data]);
    } catch (err) {
      console.error("Error requesting port:", err);
    }
  };

  //SerialPort
  const openPort = async (port: ISerialPort) => {
    await port.open({ baudRate: 115200 /* pick your baud rate */ })
    setPorts((prevPorts) => {
      return prevPorts.map(p => {
        if (p.port === port) {
          const data = { port: p.port, open: (port.readable && port.writable) ? true : false }
          return data
        }
        return p
      })
    });
  };
  const closePort = async (port: ISerialPort) => {
    try {
      if (port.readable && port.readable.locked) {
        const reader = portReaders.get(port);
        if (reader) {
          console.log("Releasing reader");
          await reader.cancel(); // Cancela a leitura e libera o leitor
          reader.releaseLock();
          portReaders.delete(port);
        }
      }

      if (port.writable && port.writable.locked) {
        console.log("Releasing writer");
        await port.writable.abort(); // Aborta a escrita e libera o escritor
      }

      if (port.readable || port.writable) {
        await port.close();
        setPorts((prevPorts) => {
          return prevPorts.map(p => {
            if (p.port === port) {
              const data = { port: p.port, open: (port.readable && port.writable) ? true : false }
              return data
            }
            return p
          })
        });
      }
    } catch (err) {
      console.error("Error when close port")
      console.error(err)
    }
  };
  const forgetPort = async (port: ISerialPort) => {
    try {
      await port.forget();
      setPorts((prevPorts) => prevPorts.filter((p) => p.port !== port));
    } catch (err) {
      console.error("Error when forget port")
      console.error(err)
    }
  };
  const getInfo = (port: ISerialPort) => {
    const info = port.getInfo()
    console.log('info', info)
    return info
  };
  const getSignals = async (port: ISerialPort) => {
    const signals = await port.getSignals()
    console.log('signals', signals)
    return signals
  };
  const readFromPort = async (port: ISerialPort, callback: (arg: string, port: ISerialPort) => void) => {
    if (!port.readable) {
      console.error("Readable stream not available");
      return;
    }

    if (port.readable.locked) {
      console.error("Readable stream is already locked");
      return;
    }
    const reader = port.readable?.getReader();
    try {
      if (!reader) {
        throw new Error("Reader not available");
      }
      portReaders.set(port, reader)
      const decoder = new TextDecoder();
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const decoded = decoder.decode(value);
        callback(decoded, port)
      }
    } catch (error) {
      console.error("Error reading from port", error);
    } finally {
      reader?.releaseLock();
      portReaders.delete(port)
    }
  };
  const writeToPort = async (port: ISerialPort, data: string) => {
    if (!port.writable) {
      console.error("Writable stream not available");
      return;
    }

    try {
      const writer = port.writable?.getWriter();
      if (!writer) {
        throw new Error("Writer not available");
      }
      const encoder = new TextEncoder();
      const message = `${data}`;
      await writer.write(encoder.encode(message));
      writer.releaseLock();
    } catch (error) {
      console.error("Error writing to port", error);
    }
  };

  return {
    ports,
    requestPort,
    closePort,
    forgetPort,
    getInfo,
    getSignals,
    openPort,
    readFromPort,
    writeToPort
  }
}