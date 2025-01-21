import { useEffect, useRef, useState } from "react";
import { INavigator, ISerialPort } from "../lib/definition/serial";

interface Props {
  handleConnection?: (port: ISerialPort) => void
  handleDisconnection?: (port: ISerialPort) => void
}

export const useSerial = (props: Props) => {
  const { handleDisconnection, handleConnection } = props
  const [ports, setPorts] = useState<ISerialPort[]>([])
  const isFirstRendering = useRef(true);  // Referência para controlar a primeira execução

  useEffect(() => {
    // if (isFirstRendering.current) {
    //   isFirstRendering.current = false
    if (typeof window !== "undefined" && "serial" in navigator) {
      const _navigator = navigator as INavigator

      _navigator.serial.getPorts().then(async (ports) => {
        setPorts(ports);
      });

      const handleConnect = (e: Event) => {
        const target = e.target as ISerialPort | null
        if (!target) return
        setPorts((prev) => [...prev, target])
        handleConnection?.(target)
      };

      const handleDisconnect = (e: Event) => {
        const target = e.target as ISerialPort | null
        if (!target) return
        setPorts((prev) => prev.filter(el => el !== target))
        handleDisconnection?.(target)
      };

      _navigator.serial.addEventListener("connect", handleConnect);
      _navigator.serial.addEventListener("disconnect", handleDisconnect);

      return () => {
        _navigator.serial.removeEventListener("connect", handleConnect);
        _navigator.serial.removeEventListener("disconnect", handleDisconnect);
      };
    }
    // }
  }, [handleDisconnection]);

  //Serial
  const requestPort = async () => {
    try {
      const port = await (navigator as INavigator).serial.requestPort();
      setPorts(prev => [...prev, port])
    } catch (err) {
      console.error("Error requesting port:", err);
    }
  };

  //SerialPort
  const openPort = async (port: ISerialPort) => {
    try {
      await port.open({ baudRate: 115200, bufferSize: 1000000 })
    } catch (e) {
      console.error("on open port", e)
    }
  };

  const closePort = async (port: ISerialPort) => {
    try {
      if (port.readable) {
        if (port.readable.locked) {
          const reader = port.readable.getReader();
          await reader.cancel();
          reader.releaseLock();
        }
      }

      if (port.writable) {
        if (port.writable.locked) {
          const writer = port.writable.getWriter();
          await writer.abort();
          writer.releaseLock();
        }
      }

      await port.close();
    } catch (err) {
      console.error("Error when close port", err)
    }
  };

  const forgetPort = async (port: ISerialPort): Promise<void> => {
    try {
      await port.forget();
    } catch (error) {
      const errorMessage = error instanceof Error ? error : new Error("Error when forgetting serial port");
      console.error(errorMessage);
      throw errorMessage;
    }
  };


  const getInfo = (port: ISerialPort) => {
    const info = port.getInfo()
    return info
  };

  const getSignals = async (port: ISerialPort) => {
    const signals = await port.getSignals()
    return signals
  };

  const getReader = async (port: ISerialPort) => {
    if (!port.readable) {
      console.error("Readable stream not available");
      return;
    }

    if (port.readable.locked) {
      console.error("Readable stream is already locked");
      return;
    }

    const reader = port.readable?.getReader();

    return reader
  }

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
    writeToPort,
    getReader
  }
}