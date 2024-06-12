"use client";
import { useSerial } from "@/app/hook/useSerial";
import { ISerialPort } from "@/app/lib/definitions/serial";
import { useState } from "react";

export function SerialConfigurator() {
  const {
    ports,
    requestPort,
    closePort,
    forgetPort,
    getInfo,
    getSignals,
    openPort,
    readFromPort,
    writeToPort,
  } = useSerial();

  /*
    Essa const serve para armazenar as mensagens parciais dentro de uma mensagem recebida, para podermos agrupar a mensagem até a entrega ser completa.
  */
  const messageBuffers = new Map<ISerialPort, string>();
  /*
    Esse state serve para armazenar as mensagens recebidas pela porta.
  */
  const [portData, setPortData] = useState<{ [key: number]: string[] }>();

  const callback = (decoded: string, port: ISerialPort) => {
    const buffer = messageBuffers.get(port) || "";
    const combined = buffer + decoded;
    const messages = combined.split("\r");
    const lastFragment = messages.pop();

    messages.forEach((message) => {
      if (message) {
        const portKey = port.getInfo().usbProductId;
        if (!portKey) return;
        setPortData((prevData) => ({
          ...prevData,
          [portKey]: [...(prevData?.[portKey] || []), message],
        }));
      }
    });

    messageBuffers.set(port, lastFragment || "");
  };

  // const callback = (decoded: string, port: ISerialPort) => {
  //   const buffer = messageBuffers.get(port) || "";
  //   const combined = buffer + decoded;
  //   const messages = combined.split("\n");
  //   console.log("messages", messages);
  //   for (let i = 0; i < messages.length - 1; i++) {
  //     console.log("foor", messages.length - 1);
  //     const message = messages[i];
  //     setPortData((prevData) => {
  //       const portKey = port.getInfo().usbProductId;
  //       if (!portKey) return prevData;
  //       const existingData = prevData?.[portKey] || [];
  //       return {
  //         ...prevData,
  //         [portKey]: [...existingData, message],
  //       };
  //     });
  //   }
  //   messageBuffers.set(port, messages[messages.length - 1]);
  // };

  const openPortAndRequestConfig = async (port: ISerialPort) => {
    await port.open({ baudRate: 115200 /* pick your baud rate */ });
    readFromPort(port, callback);
    // await new Promise(resolve => setTimeout(resolve, 100));
    // await writeToPort(port, "IMEI")
    // await new Promise(resolve => setTimeout(resolve, 100));
    // await writeToPort(port, "ICCID")
    await new Promise((resolve) => setTimeout(resolve, 100));
    await writeToPort(port, "CHECK");
    await new Promise((resolve) => setTimeout(resolve, 100));
    await writeToPort(port, "STATUS");
    // await new Promise((resolve) => setTimeout(resolve, 100));
    // await writeToPort(port, "ET");
  };

  return (
    <div>
      <h1>Serial Configurator</h1>
      <button onClick={requestPort}>Request Port</button>
      <ul>
        {ports.map((port, index) => (
          <li key={index}>
            Port {index + 1}
            &nbsp; &nbsp;
            <button onClick={() => openPortAndRequestConfig(port)}>
              Abrir e configuração
            </button>
            &nbsp;
            <button onClick={() => openPort(port)}>Abrir</button>
            &nbsp;
            <button onClick={() => closePort(port)}>Fechar</button>
            &nbsp;
            <button onClick={() => forgetPort(port)}>Esquecer</button>
            &nbsp;
            <button onClick={() => getInfo(port)}>Info</button>
            &nbsp;
            <button onClick={() => getSignals(port)}>Signals</button>
            &nbsp;
            <button onClick={() => readFromPort(port, callback)}>
              Ler porta
            </button>
            &nbsp;
            <button onClick={() => writeToPort(port, "IMEI")}>
              Enviar Ping
            </button>
            {Object.entries(portData ?? {})
              .filter(([key]) => Number(key) === port.getInfo().usbProductId)
              .map(([_, data]) =>
                data.map((d, index) => <p key={d + index}>{d}</p>)
              )}
            {Object.entries(portData ?? {})
              .filter(([key]) => Number(key) === port.getInfo().usbProductId)
              .map(([_, data]) => data.length)}
          </li>
        ))}
      </ul>
    </div>
  );
}
