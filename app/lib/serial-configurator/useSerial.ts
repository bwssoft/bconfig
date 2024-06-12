import { useEffect, useState } from "react";
import { INavigator, ISerialPort } from "../definitions/serial";

export const useSerial = () => {
  const [ports, setPorts] = useState<ISerialPort[]>([]);
  const portReaders = new Map<ISerialPort, ReadableStreamDefaultReader<Uint8Array>>()
  const messageBuffers = new Map<ISerialPort, string>(); // Buffer para armazenar mensagens parciais
  const [portData, setPortData] = useState<{ [key: number]: string[] }>()

  useEffect(() => {
    if (typeof window !== "undefined" && "serial" in navigator) {
      const _navigator = navigator as INavigator

      _navigator.serial.getPorts().then(async (ports) => {
        setPorts(ports);
      });

      const handleConnect = (e: Event) => {
        const target = e.target as ISerialPort | null
        if (!target) return
        setPorts((prevPorts) => [...prevPorts, target]);
      };

      const handleDisconnect = (e: Event) => {
        const target = e.target as ISerialPort | null
        if (!target) return
        setPorts((prevPorts) => prevPorts.filter((port) => port !== target));
      };

      _navigator.serial.addEventListener(
        "connect",
        handleConnect
      );
      _navigator.serial.addEventListener(
        "disconnect",
        handleDisconnect
      );

      return () => {
        _navigator.serial.removeEventListener(
          "connect",
          handleConnect
        );
        _navigator.serial.removeEventListener(
          "disconnect",
          handleDisconnect
        );
      };
    }
  }, []);

  //Serial
  const requestPort = async () => {
    try {
      const port = await (navigator as INavigator).serial.requestPort();
      setPorts((prevPorts) => [...prevPorts, port]);
    } catch (err) {
      console.error("Error requesting port:", err);
    }
  };


  //SerialPort
  const openPort = async (port: ISerialPort) => {
    await port.open({ baudRate: 115200 /* pick your baud rate */ })
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
      }
    } catch (err) {
      console.error("Error when close port")
      console.error(err)
    }
  };
  const forgetPort = async (port: ISerialPort) => {
    try {
      if (port.readable || port.writable) {
        await port.forget();
      }
      setPorts((prevPorts) => prevPorts.filter((p) => p !== port));

    } catch (err) {
      console.error("Error when forget port")
      setPorts((prevPorts) => prevPorts.filter((p) => p !== port)); // Remove port from state even if it's already closed
      console.error(err)
    }
  };
  const getInfo = (port: ISerialPort) => {
    console.log(port.getInfo())
    return port.getInfo()
  };
  const getSignals = async (port: ISerialPort) => {
    console.log(await port.getSignals())
  };
  const readFromPort = async (port: ISerialPort) => {
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
      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          break;
        }
        const decoded = new TextDecoder().decode(value)
        setPortData((prevData) => {
          const portKey = port.getInfo().usbProductId;
          if (!portKey) return prevData
          const existingData = prevData?.[portKey] || [];
          return {
            ...prevData,
            [portKey]: [...existingData, decoded],
          };
        });
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

    // if (!port.writable.locked) {
    //   console.error("Writable stream is already locked");
    //   return;
    // }

    try {
      const writer = port.writable?.getWriter();
      if (!writer) {
        throw new Error("Writer not available");
      }
      const encoder = new TextEncoder();
      const message = `${data}`;
      console.log("message", message)
      await writer.write(encoder.encode(message));
      writer.releaseLock();
    } catch (error) {
      console.error("Error writing to port", error);
    }
  };

  //actions
  const openPortAndRequestConfig = async (port: ISerialPort) => {
    await port.open({ baudRate: 115200 /* pick your baud rate */ })
    readFromPort(port)
    // await new Promise(resolve => setTimeout(resolve, 100));
    // await writeToPort(port, "IMEI")
    // await new Promise(resolve => setTimeout(resolve, 100));
    // await writeToPort(port, "ICCID")
    await new Promise(resolve => setTimeout(resolve, 100));
    await writeToPort(port, "CHECK")
    // await new Promise(resolve => setTimeout(resolve, 100));
    // await writeToPort(port, "STATUS")
    // await new Promise(resolve => setTimeout(resolve, 100));
    // await writeToPort(port, "ET")
  };

  return {
    ports,
    portData,
    requestPort,
    closePort,
    forgetPort,
    getInfo,
    getSignals,
    openPort,
    readFromPort,
    writeToPort,
    openPortAndRequestConfig
  }
}