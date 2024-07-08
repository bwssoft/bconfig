import { useEffect, useState, useRef } from "react"
import { useSerial } from "./use-serial"
import { ISerialPort } from "../lib/definition/serial"
import { sleep } from "../lib/util/sleep"
import { E3 } from "../lib/parser/e3+"
import { IProfile } from "../lib/definition"
import { E3Encoder } from "../lib/encoder/e3+"
import { checkWithDifference } from "../lib/util"

type DeviceIdentified = {
  isIdentified: boolean
  port: ISerialPort
  imei?: string
  iccid?: string
  et?: string
}

type DeviceConfigured = {
  uid: string
  port: ISerialPort
  init_time_configuration: number
  end_time_configuration: number
  commands_sent: {
    init_time_command: number
    end_time_command?: number
    request: string
    response?: string
  }[]
}

type DeviceConfiguration = IProfile["config"]

interface ConfigurationResult {
  port: ISerialPort;
  desired_config: IProfile["config"];
  actual_config?: IProfile["config"];
  checked: boolean;
  not_configured: { [key in keyof IProfile]: { value1: any; value2: any } };
  metadata: DeviceConfigured;
}

type DeviceResponse = string | undefined

export function useE3Communication() {
  const [deviceIdentified, setDeviceIdentified] = useState<DeviceIdentified[]>([])
  const [configurations, setConfigurations] = useState<ConfigurationResult[]>([]);
  const previousPorts = useRef<ISerialPort[]>([])

  const { ports, writeToPort, openPort, getReader, requestPort, closePort } = useSerial({
    handleDisconnection: (port) => {
      setDeviceIdentified(prev => prev.filter(el => el.port !== port))
    }
  })

  //
  const readDeviceResponse = async (reader: ReadableStreamDefaultReader<Uint8Array>, command: string) => {
    const decoder = new TextDecoder()
    let buffer = ""
    let foundCommandResponse = false
    const timeoutPromise = new Promise<undefined>((resolve) =>
      setTimeout(() => resolve(undefined), 500)
    );

    const readPromise = (async () => {
      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        buffer += chunk;

        let lines = buffer.split("\r\n");
        buffer = lines.pop() || "";
        for (const line of lines) {
          if (line.length > 0) {
            if (line.includes(`SMS:${command}`)) {
              foundCommandResponse = true;
            } else if (foundCommandResponse) {
              return line;
            }
          }
        }
      }
      return undefined;
    })();

    return Promise.race([readPromise, timeoutPromise]);
  }
  const sendCommandAndReadResponse = async (port: ISerialPort, command: string, reader: ReadableStreamDefaultReader<Uint8Array>) => {
    await sleep(100);
    await writeToPort(port, command);
    return await readDeviceResponse(reader, command);
  };
  const sendCommandWithRetries = async (port: ISerialPort, command: string) => {
    let attempts = 0;
    const maxRetries = 3
    while (attempts < maxRetries) {
      await sleep(100)
      const reader = await getReader(port)
      if (!reader) return
      try {
        await writeToPort(port, command);
        const response = await readDeviceResponse(reader, command);
        await reader.cancel()
        reader.releaseLock()
        if (response) return response
      } catch (error) {
        await reader.cancel()
        reader.releaseLock()
        console.error(`ERROR [sendCommandWithRetries] ${attempts + 1} for command ${command}:`, error);
      }
      attempts++;
    }
  }

  //
  const getDeviceIdentification = async (port: ISerialPort): Promise<DeviceIdentified | undefined> => {
    if (port.readable && port.writable) return
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      await openPort(port);
      reader = await getReader(port);
      if (!reader) {
        await closePort(port)
        return
      }
      let attempts = 0
      const max_retries = 3
      let imei: DeviceResponse, iccid: DeviceResponse, et: DeviceResponse
      // Main loop to gather device info
      while (attempts < max_retries && (!imei || !iccid || !et)) {
        await sendCommandAndReadResponse(port, "REG000000#", reader);
        await sendCommandAndReadResponse(port, "SMS1", reader);
        await sendCommandAndReadResponse(port, "EN", reader);
        if (!imei) imei = await sendCommandAndReadResponse(port, "IMEI", reader);
        if (!iccid) iccid = await sendCommandAndReadResponse(port, "ICCID", reader);
        if (!et) et = await sendCommandAndReadResponse(port, "ET", reader);
        attempts++
      }
      const isIdentified = imei !== undefined && iccid !== undefined && et !== undefined
      reader?.releaseLock();
      await closePort(port);
      return {
        port,
        iccid: iccid ? E3.iccid(iccid) : undefined,
        imei: imei ? E3.imei(imei) : undefined,
        et: et ? E3.et(et) : undefined,
        isIdentified
      }
    } catch (e) {
      console.error("ERROR [getDeviceIdentification]", e);
      if (reader) reader.releaseLock();
      await closePort(port);
      return await getDeviceIdentification(port);
    }
  };
  const getDeviceConfig = async (port: ISerialPort): Promise<DeviceConfiguration | undefined> => {
    if (port.readable && port.writable) return
    let reader: ReadableStreamDefaultReader<Uint8Array> | undefined;
    try {
      await openPort(port);
      reader = await getReader(port);
      if (!reader) {
        await closePort(port)
        return
      }
      let attempts = 0
      const max_retries = 3
      let check: DeviceResponse, cxip: DeviceResponse, dns: DeviceResponse;
      while (attempts < max_retries && (!check || !cxip || !dns)) {
        await sendCommandAndReadResponse(port, "REG000000#", reader);
        await sendCommandAndReadResponse(port, "SMS1", reader);
        await sendCommandAndReadResponse(port, "EN", reader);
        if (!check) check = await sendCommandAndReadResponse(port, "CHECK", reader);
        if (!cxip) cxip = await sendCommandAndReadResponse(port, "CXIP", reader);
        if (!dns) dns = await sendCommandAndReadResponse(port, "DNS", reader);
        attempts++
      }
      reader?.releaseLock();
      await closePort(port);
      const _check = check ? E3.check(check) : undefined;
      return {
        ip: cxip ? E3.ip(cxip) : undefined,
        dns: dns ? E3.dns(dns) : undefined,
        apn: _check?.apn ?? undefined,
        timezone: _check?.timezone ?? undefined,
        lock_type: _check?.lock_type ?? undefined,
        data_transmission: _check?.data_transmission ?? undefined,
        odometer: _check?.odometer ?? undefined,
        keep_alive: _check?.keep_alive ?? undefined,
        accelerometer_sensitivity: _check?.accelerometer_sensitivity ?? undefined,
        economy_mode: _check?.economy_mode ?? undefined,
        lbs_position: _check?.lbs_position ?? undefined,
        cornering_position_update: _check?.cornering_position_update ?? undefined,
        ignition_alert_power_cut: _check?.ignition_alert_power_cut ?? undefined,
        gprs_failure_alert: _check?.gprs_failure_alert ?? undefined,
        led: _check?.led ?? undefined,
        virtual_ignition: _check?.virtual_ignition ?? undefined,
      }
    } catch (e) {
      console.error("ERROR [getDeviceConfig]", e);
      if (reader) reader.releaseLock();
      await closePort(port);
      return await getDeviceConfig(port);
    }
  };
  const configureDevice = async (port: ISerialPort, commands: string[]): Promise<DeviceConfigured> => {
    try {
      const commands_sent = []
      await openPort(port)
      const uid = crypto.randomUUID()
      const init_time_configuration = Date.now()
      for (let command of commands) {
        const init_time_command = Date.now()
        const response = await sendCommandWithRetries(port, command);
        const end_time_command = Date.now()
        commands_sent.push({
          response,
          request: command,
          init_time_command,
          end_time_command: response ? end_time_command : undefined
        })
      }
      const end_time_configuration = Date.now()
      await closePort(port)
      return {
        uid,
        init_time_configuration,
        end_time_configuration,
        commands_sent,
        port
      }
    } catch (e) {
      console.error('ERROR [configureDevice]', e);
      await closePort(port)
      return await configureDevice(port, commands)
    }
  }


  //
  const handleDeviceIdentification = async (ports: ISerialPort[]) => {
    try {
      for (let port of ports) {
        const identification = await getDeviceIdentification(port)
        if (identification) setDeviceIdentified(prev => [...prev, identification])
      }
    } catch (e) {
      console.error("[handleDeviceIdentification]", e)
    }
  }
  const handleDeviceConfiguration = async (ports: ISerialPort[], desired_config: IProfile["config"]) => {
    if (!desired_config) return
    const commands: string[] = [];
    Object.entries(desired_config).forEach(([command, args]) => {
      const _command = E3Encoder.encoder({ command, args } as any);
      if (_command) {
        commands.push(...(Array.isArray(_command) ? _command : [_command]));
      }
    });
    const _commands = ["REG000000#", "SMS1", "EN", "IMEI", ...commands]
    const result: ConfigurationResult[] = [];
    for (let port of ports) {
      const configured_device = await configureDevice(port, _commands);
      const actual_config = await getDeviceConfig(port);
      //deletar essa propriedade pois não tem como verificar a senha do equipamento
      delete desired_config?.password;
      const {
        isEqual: checked,
        difference: not_configured
      } = checkWithDifference(desired_config, actual_config)
      result.push({
        port,
        actual_config: actual_config ?? undefined,
        desired_config,
        checked,
        not_configured,
        metadata: configured_device,
      });
    }
    setConfigurations((prev: any) => [...prev, ...result]);
  }


  useEffect(() => {
    const newPorts = ports.filter(port => !previousPorts.current.includes(port));

    if (newPorts.length > 0) {
      handleDeviceIdentification(newPorts);
    }

    previousPorts.current = ports
  }, [ports]);



  return {
    deviceIdentified,
    requestPort,
    ports,
    getDeviceConfig,
    handleDeviceConfiguration,
    configurations
  }
}
