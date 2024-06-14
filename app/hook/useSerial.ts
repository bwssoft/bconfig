import { useEffect, useState } from "react";
import { INavigator, ISerialPort } from "../lib/definitions/serial";

export const useSerial = () => {
  /*
    Esse state serve para armazenar as portas disponiveis para utilização.
  */
  const [ports, setPorts] = useState<{
    port: ISerialPort,
    open: boolean,
    reader: ReadableStreamDefaultReader<Uint8Array> | undefined
  }[]>([]);

  const portIsOpen = (port: ISerialPort) => {
    return (port.readable && port.writable) ? true : false
  }


  useEffect(() => {
    if (typeof window !== "undefined" && "serial" in navigator) {
      const _navigator = navigator as INavigator

      _navigator.serial.getPorts().then((ports) => {
        setPorts(ports.map(port => ({
          port,
          open: portIsOpen(port),
          reader: undefined
        })));
      });

      const handleConnect = (e: Event) => {
        const target = e.target as ISerialPort | null
        if (!target) return
        const data = {
          port: target,
          open: portIsOpen(target),
          reader: undefined
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
      const data = { port, open: portIsOpen(port), reader: undefined }
      setPorts((prevPorts) => [...prevPorts, data]);
    } catch (err) {
      console.error("Error requesting port:", err);
    }
  };

  //SerialPort
  const openPort = async (port: ISerialPort) => {
    try {
      await port.open({ baudRate: 115200 })
      setPorts((prevPorts) => {
        return prevPorts.map(p => {
          if (p.port === port) {
            const data = { port: p.port, open: portIsOpen(port), reader: undefined }
            return data
          }
          return p
        })
      });
    } catch (e) {
      console.error("on open port", e)
    }
  };
  const closePort = async (port: ISerialPort) => {
    try {
      const portData = ports.find(p => p.port === port);
      if (portData?.reader) {
        console.log("Releasing reader");
        await portData.reader.cancel();
        portData.reader.releaseLock();
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
              const data = { port: p.port, open: portIsOpen(port), reader: undefined }
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
      setPorts((prevPorts) => {
        return prevPorts.map(p => {
          if (p.port === port) {
            return { ...p, reader };
          }
          return p;
        });
      });
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

  const readSingleResponseFromPort = async (
    port: ISerialPort,
    command: string,
    callback: (arg: string, port: ISerialPort) => void,
    timeout = 500
  ) => {
    if (!port.readable || !port.writable) {
      console.error("Readable or writable stream not available");
      return;
    }

    if (port.readable.locked || port.writable.locked) {
      console.error("Readable or writable stream is already locked");
      return;
    }

    const reader = port.readable.getReader();
    const writer = port.writable.getWriter();

    try {
      // Send the command
      const encoder = new TextEncoder();
      await writer.write(encoder.encode(command));
      writer.releaseLock();

      // Read the response
      const decoder = new TextDecoder();
      let buffer = '';
      let timedOut = false

      const timeoutPromise = new Promise<void>((resolve, _) => {
        setTimeout(() => {
          timedOut = true;
          resolve();
        }, timeout);
      });

      const readPromise = (async () => {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            break;
          }
          buffer += decoder.decode(value);
          if (buffer.includes('\n')) {
            return buffer.replace(/[\n\r]/g, '');;
          }
        }
      })();

      const response = await Promise.race([readPromise, timeoutPromise]);

      if (!timedOut) {
        callback(response as string, port);
      } else {
        console.info("Operation timed out");
      }
      reader.releaseLock();
    } catch (error) {
      console.error("Error during communication with the port", error);
    }
  }


  return {
    ports,
    requestPort,
    closePort,
    forgetPort,
    getInfo,
    getSignals,
    openPort,
    readFromPort,
    writeToPort,
    readSingleResponseFromPort
  }
}