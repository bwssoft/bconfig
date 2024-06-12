"use client";
import { useSerial } from "./useSerial";

export function SerialConfigurator() {
  const {
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
    openPortAndRequestConfig,
  } = useSerial();

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
            <button onClick={() => readFromPort(port)}>Ler porta</button>
            &nbsp;
            <button onClick={() => writeToPort(port, "IMEI")}>
              Enviar Ping
            </button>
            {Object.entries(portData ?? {})
              .filter(([key]) => Number(key) === port.getInfo().usbProductId)
              .map(([key, data]) =>
                data.map((d, index) => <p key={d + index}>{d}</p>)
              )}
            {Object.entries(portData ?? {})
              .filter(([key]) => Number(key) === port.getInfo().usbProductId)
              .map(([key, data]) => data.length)}
          </li>
        ))}
      </ul>
    </div>
  );
}
