import { useEffect, useState, useRef, useCallback } from "react";
import { useSerial } from "./use-serial";
import { ISerialPort } from "../lib/definition/serial";
import { sleep } from "../lib/util/sleep";
import {
  ConfigurationMetadata,
  DeviceNativeProfile,
  DeviceProfile,
  IProfile,
} from "../lib/definition";
import { checkWithDifference } from "../lib/util";
import { toast } from "./use-toast";
import { createOneConfigurationLog } from "../lib/action/configuration-log.action";
import { E34G } from "../lib/parser/E34G";
import { E34GEncoder } from "../lib/encoder/E34G";
import { useRouter } from "next/navigation";

interface Identified {
  isIdentified: boolean;
  port: ISerialPort;
  imei?: string;
  iccid?: string;
  et?: string;
}
interface IdentifiedLog {
  port: ISerialPort;
  label: string;
  progress: number;
}

export interface Configuration {
  id: string;
  port: ISerialPort;
  imei: string;
  iccid?: string;
  et: string;
  desired_profile: DeviceProfile;
  actual_profile?: DeviceProfile;
  actual_native_profile?: DeviceNativeProfile;
  is_configured: boolean;
  not_configured: {
    [key in keyof IProfile["config"]]: { value1: any; value2: any };
  };
  metadata: ConfigurationMetadata;
  profile_name: string;
  profile_id: string;
  model: "E3+4G" | "E3+";
}
interface ConfigurationLog {
  imei: string;
  label: string;
  progress: number;
}

type DeviceResponse = string | undefined;

let countdownTimeout: NodeJS.Timeout;

export function useE34GCommunication() {
  const [isConfigurationDisabled, setIsConfigurationDisabled] =
    useState<boolean>(true);
  const [configurationDisabledTimer, setConfigurationDisabledTimer] =
    useState<number>(10);

  const [identified, setIdentified] = useState<Identified[]>([]);
  const [identifiedLog, setIdentifiedLog] = useState<IdentifiedLog[]>([]);
  const [inIdentification, setInIdentification] = useState<boolean>(false);

  const [configuration, setConfiguration] = useState<Configuration[]>([]);
  const [configurationLog, setConfigurationLog] = useState<ConfigurationLog[]>(
    []
  );
  const [inConfiguration, setInConfiguration] = useState<boolean>(false);

  const previousPorts = useRef<ISerialPort[]>([]);
  const disconnectedPorts = useRef<ISerialPort[]>([]);

  const router = useRouter();

  const handleSerialDisconnection = useCallback(
    (port: ISerialPort) => {
      toast({
        title: "Desconexão!",
        description: "Equipamento desconectado!",
        variant: "success",
        className:
          "destructive group border bg-stone-400 border-stone-300 text-white",
      });
      disconnectedPorts.current.push(port);
      setIdentified((prev) => {
        const _identified = prev.find((el) => el.port === port);
        const updatedIdentified = prev.filter((el) => el.port !== port);
        setIdentifiedLog((prevLog) => prevLog.filter((el) => el.port !== port));
        setConfigurationLog((prevLog) =>
          prevLog.filter((el) => el.imei !== _identified?.imei)
        );
        setConfiguration((prevConfig) =>
          prevConfig.filter((el) => el.imei !== _identified?.imei)
        );
        return updatedIdentified;
      });
    },
    [setIdentified, setConfiguration]
  );

  const handleSerialConnection = (port: ISerialPort) => {
    toast({
      title: "Conexão!",
      description: "Equipamento conectado!",
      variant: "success",
    });

    setIsConfigurationDisabled(true);
    setConfigurationDisabledTimer(10);
  };

  const {
    ports,
    writeToPort,
    openPort,
    getReader,
    requestPort,
    closePort,
    forgetPort,
  } = useSerial({
    handleDisconnection: handleSerialDisconnection,
    handleConnection: handleSerialConnection,
  });

  //
  const readDeviceResponse = async (
    reader: ReadableStreamDefaultReader<Uint8Array>
  ) => {
    const decoder = new TextDecoder();
    let buffer = "";
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
            return line;
          }
        }
      }
      return undefined;
    })();

    return Promise.race([readPromise, timeoutPromise]);
  };
  const sendCommandWithRetries = async (port: ISerialPort, command: string) => {
    let attempts = 0;
    const maxRetries = 3;
    while (attempts < maxRetries) {
      await sleep(100);
      const reader = await getReader(port);
      if (!reader) return;
      try {
        await writeToPort(port, command);
        const response = await readDeviceResponse(reader);
        await reader.cancel();
        reader.releaseLock();
        if (response) return response;
      } catch (error) {
        await reader.cancel();
        reader.releaseLock();
        console.error(
          `ERROR [sendCommandWithRetries] ${
            attempts + 1
          } for command ${command}:`,
          error
        );
      }
      attempts++;
    }
  };

  //
  const getDeviceIdentification = async (
    props: {
      port: ISerialPort;
      callback: {
        onOpenPort: () => void;
        onPortOpened: () => void;
        onImei: () => void;
        onIccid: () => void;
        onEt: () => void;
        onClosePort: () => void;
        onFinished: () => void;
      };
    },
    depth = 3
  ): Promise<Identified | undefined> => {
    const { port, callback } = props;
    if (port.readable && port.writable) return;
    if (depth <= 0) return undefined;
    try {
      callback.onOpenPort();
      await openPort(port);
      callback.onPortOpened();
      // let attempts = 0
      // const max_retries = 3
      // Main loop to gather device info
      // while (attempts < max_retries && (!imei || !iccid || !et)) {
      callback.onImei();
      const imei = await sendCommandWithRetries(port, "IMEI");
      callback.onIccid();
      const iccid = await sendCommandWithRetries(port, "ICCID");
      callback.onEt();
      const et = await sendCommandWithRetries(port, "ET");
      //   attempts++
      // }
      const isIdentified =
        imei !== undefined && iccid !== undefined && et !== undefined;
      callback.onClosePort();
      await closePort(port);
      callback.onFinished();
      return {
        port,
        iccid: iccid ? E34G.iccid(iccid) : undefined,
        imei: imei ? E34G.imei(imei) : undefined,
        et: et ? E34G.et(et) : undefined,
        isIdentified,
      };
    } catch (e) {
      console.error("ERROR [getDeviceIdentification]", e);
      await closePort(port);
      return await getDeviceIdentification(props);
    }
  };
  const getDeviceProfile = async (
    port: ISerialPort,
    depth = 3
  ): Promise<
    { profile: DeviceProfile; native_profile: DeviceNativeProfile } | undefined
  > => {
    if (port.readable && port.writable) return;
    if (depth <= 0) return undefined;
    try {
      await openPort(port);
      // let attempts = 0
      // const max_retries = 3
      let check: DeviceResponse, cxip: DeviceResponse, status: DeviceResponse;
      // while (attempts < max_retries && (!check || !cxip || !dns)) {
      if (!check) check = await sendCommandWithRetries(port, "CHECK");
      if (!cxip) cxip = await sendCommandWithRetries(port, "CXIP");
      if (!status) status = await sendCommandWithRetries(port, "STATUS");
      //   attempts++
      // }
      await closePort(port);
      const _check = check ? E34G.check(check) : undefined;
      const _status = status ? E34G.status(status) : undefined;
      return {
        profile: {
          ip: cxip ? E34G.ip(cxip) : undefined,
          dns: cxip ? E34G.dns(cxip) : undefined,
          apn: _check?.apn ?? undefined,
          timezone: _check?.timezone ?? undefined,
          lock_type: _check?.lock_type ?? undefined,
          data_transmission: _check?.data_transmission ?? undefined,
          odometer: _check?.odometer ?? undefined,
          keep_alive: _check?.keep_alive ?? undefined,
          accelerometer_sensitivity:
            _check?.accelerometer_sensitivity ?? undefined,
          economy_mode: _check?.economy_mode ?? undefined,
          lbs_position: _check?.lbs_position ?? undefined,
          cornering_position_update:
            _check?.cornering_position_update ?? undefined,
          led: _check?.led ?? undefined,
          max_speed: _check?.max_speed ?? undefined,
          virtual_ignition: _check?.virtual_ignition ?? undefined,
          virtual_ignition_by_voltage:
            _check?.virtual_ignition_by_voltage ?? undefined,
          virtual_ignition_by_movement:
            _check?.virtual_ignition_by_movement ?? undefined,
          communication_type: _check?.communication_type ?? undefined,
          protocol_type: _check?.protocol_type ?? undefined,
          anti_theft: _check?.anti_theft ?? undefined,
          jammer_detection: _check?.jammer_detection ?? undefined,
          angle_adjustment: _check?.angle_adjustment ?? undefined,
          lock_type_progression: _check?.lock_type_progression ?? undefined,
          ignition_by_voltage: _check?.ignition_by_voltage ?? undefined,
          input_1: _check?.input_1 ?? undefined,
          input_2: _check?.input_2 ?? undefined,
          sensitivity_adjustment: _check?.sensitivity_adjustment ?? undefined,
          ack: _check?.ack ?? undefined,
          horimeter: _status?.["HR"]
            ? E34G.horimeter(_status?.["HR"])
            : undefined,
        },
        native_profile: {
          cxip,
          check,
          status,
        },
      };
    } catch (e) {
      console.error("ERROR [getDeviceProfile]", e);
      await closePort(port);
      return await getDeviceProfile(port, depth - 1);
    }
  };
  const configureDevice = async (input: {
    port: ISerialPort;
    commands: string[];
    callback: {
      onOpenPort: () => void;
      onPortOpened: () => void;
      onSendCommand: (command: string, idx: number) => void;
      onClosePort: () => void;
      onFinished: () => void;
    };
  }): Promise<ConfigurationMetadata> => {
    const { port, commands, callback } = input;
    try {
      const commands_sent = [];
      callback.onOpenPort();
      await openPort(port);
      callback.onPortOpened();
      const init_time_configuration = Date.now();
      for (let c = 0; c < commands.length; c++) {
        const command = commands[c];
        callback.onSendCommand(command, c);
        const response = await sendCommandWithRetries(port, command);
        await sleep(150);
        commands_sent.push({
          response,
          request: command,
        });
      }
      const end_time_configuration = Date.now();
      callback.onClosePort();
      await closePort(port);
      callback.onFinished();
      return {
        init_time_configuration,
        end_time_configuration,
        commands_sent,
        port,
      };
    } catch (e) {
      console.error("ERROR [configureDevice]", e);
      await closePort(port);
      return await configureDevice({ port, commands, callback });
    }
  };

  //
  const handleDeviceIdentification = async (ports: ISerialPort[]) => {
    try {
      setInIdentification(true);
      for (let port of ports) {
        const total_steps = 8;
        const identification = await getDeviceIdentification({
          port,
          callback: {
            onOpenPort: () =>
              updateIdentifiedLog({
                port,
                step_label: "Abrindo a porta",
                step_index: 1,
                total_steps,
              }),
            onPortOpened: () =>
              updateIdentifiedLog({
                port,
                step_label: "Porta aberta",
                step_index: 2,
                total_steps,
              }),
            onImei: () =>
              updateIdentifiedLog({
                port,
                step_label: "IMEI",
                step_index: 3,
                total_steps,
              }),
            onIccid: () =>
              updateIdentifiedLog({
                port,
                step_label: "ICCID",
                step_index: 4,
                total_steps,
              }),
            onEt: () =>
              updateIdentifiedLog({
                port,
                step_label: "ET",
                step_index: 5,
                total_steps,
              }),
            onClosePort: () =>
              updateIdentifiedLog({
                port,
                step_label: "Fechando a porta",
                step_index: 6,
                total_steps,
              }),
            onFinished: () =>
              updateIdentifiedLog({
                port,
                step_label: "Porta Fechada",
                step_index: 7,
                total_steps,
              }),
          },
        });
        updateIdentifiedLog({
          port,
          step_label: "Processo Finalizado",
          step_index: 8,
          total_steps,
        });
        const portHasDisconnected = disconnectedPorts.current.find(
          (p) => p === port
        );
        if (identification) {
          if (portHasDisconnected) {
            setIdentified((prev) => {
              const updatedIdentified = prev.filter((el) => el.port !== port);
              setIdentifiedLog((prevLog) =>
                prevLog.filter((el) => el.port !== port)
              );
              return updatedIdentified;
            });
          } else if (!portHasDisconnected) {
            setIdentified((prev) => {
              const oldIdentifiers = prev.filter((el) => el.port !== port);
              return oldIdentifiers.concat(identification);
            });
          }
        } else {
          setIdentified((prev) => {
            const oldIdentifiers = prev.filter((el) => el.port !== port);
            return oldIdentifiers.concat({ port, isIdentified: false });
          });
        }

        // vo buta aqui

        setTimeout(() => {
          setIsConfigurationDisabled(false);
        }, 10000);
      }
      setInIdentification(false);
    } catch (e) {
      console.error("[handleDeviceIdentification]", e);
    }
  };
  const handleDeviceConfiguration = async (
    devices: Identified[],
    desired_profile: IProfile
  ) => {
    try {
      setInConfiguration(true);
      const commands = parseCommands(desired_profile);
      for (let device of devices) {
        const { port, imei, iccid, et } = device;
        if (!imei || !et) continue;
        const total_steps = commands.length + 9;

        updateConfigurationLog({
          imei,
          step_index: 0,
          step_label: "Iniciando a configuração",
          total_steps,
        });

        const configured_device = await configureDevice({
          port,
          commands,
          callback: {
            onOpenPort: () =>
              updateConfigurationLog({
                imei,
                step_label: "Abrindo a porta",
                step_index: 1,
                total_steps,
              }),
            onPortOpened: () =>
              updateConfigurationLog({
                imei,
                step_label: "Porta aberta",
                step_index: 2,
                total_steps,
              }),
            onSendCommand: (command, idx) =>
              updateConfigurationLog({
                imei,
                step_label: command,
                step_index: 2 + idx,
                total_steps,
              }),
            onClosePort: () =>
              updateConfigurationLog({
                imei,
                step_label: "Fechando a porta",
                step_index: total_steps - 6,
                total_steps,
              }),
            onFinished: () =>
              updateConfigurationLog({
                imei,
                step_label: "Porta fechada",
                step_index: total_steps - 5,
                total_steps,
              }),
          },
        });

        updateConfigurationLog({
          imei,
          step_label: "Requisitando configuração",
          step_index: total_steps - 4,
          total_steps,
        });

        const { profile: actual_profile, native_profile } =
          (await getDeviceProfile(port)) ?? {};

        updateConfigurationLog({
          imei,
          step_label: "Checando as diferenças",
          step_index: total_steps - 3,
          total_steps,
        });

        delete desired_profile.config?.password;
        const {
          isEqual: all_fields_have_been_checked,
          difference: fields_not_configured,
        } = checkWithDifference(desired_profile.config, actual_profile);

        const is_configured = configured_device.commands_sent.every(
          (c) => typeof c.response !== "undefined"
        );
        const id = crypto.randomUUID();

        const configuration_result = {
          id,
          port,
          imei,
          iccid,
          et,
          actual_profile: actual_profile ?? undefined,
          actual_native_profile: native_profile ?? undefined,
          desired_profile: desired_profile.config,
          is_configured,
          not_configured: fields_not_configured,
          metadata: configured_device,
          profile_id: desired_profile.id,
          profile_name: desired_profile.name,
          model: "E3+4G" as Configuration["model"],
          need_double_check: true,
          has_double_check: false,
        };

        updateConfigurationLog({
          imei,
          step_index: total_steps - 2,
          step_label: "Envio de comandos finalizados",
          total_steps,
        });
        const portHasDisconnected = disconnectedPorts.current.find(
          (p) => p === port
        );
        if (portHasDisconnected) {
          setConfiguration((prev) => {
            const _identified = identified.find((el) => el.port === port);
            const updatedConfiguration = prev.filter((el) => el.port !== port);
            setConfigurationLog((prevLog) =>
              prevLog.filter((el) => el.imei !== _identified?.imei)
            );
            return updatedConfiguration;
          });
        } else if (!portHasDisconnected) {
          setConfiguration((prev) => prev.concat(configuration_result));
        }
        updateConfigurationLog({
          imei,
          step_index: total_steps - 1,
          step_label: "Salvando no banco de dados",
          total_steps,
        });
        await createOneConfigurationLog(
          JSON.parse(JSON.stringify(configuration_result))
        );
        if (is_configured) {
          updateConfigurationLog({
            imei,
            step_index: total_steps,
            step_label: "Processo finalizado",
            total_steps,
          });
          toast({
            title: "Configurado!",
            description: `Equipamento configurado com sucesso! (${imei})`,
            variant: "success",
          });
          router.push("/check/E3+4G");
        } else {
          toast({
            title: "Não Configurado!",
            description: `Equipamento não foi configurado! (${imei})`,
            variant: "error",
          });
        }
      }
      setInConfiguration(false);
    } catch (e) {
      console.error("[handleDeviceConfiguration]", e);
    }
  };

  //util function
  const parseCommands = (profile: IProfile) => {
    const configure_commands: string[] = [];
    Object.entries(profile.config).forEach(([command, args]) => {
      const optional_functions_to_remove = profile.optional_functions
        ? Object.entries(profile.optional_functions)
            .filter(([_, value]) => value === false)
            .map(([key]) => key)
        : [];
      if (optional_functions_to_remove.includes(command)) return;

      const _command = E34GEncoder.encoder({ command, args } as any);
      if (_command) {
        configure_commands.push(
          ...(Array.isArray(_command) ? _command : [_command])
        );
      }
    });
    // const all_commands = configure_commands.concat(["RESTART"])
    return configure_commands;
  };
  const updateConfigurationLog = (input: {
    step_label: string;
    step_index: number;
    imei: string;
    total_steps: number;
  }) => {
    const { imei, total_steps, step_index, step_label } = input;
    const percentage = Math.round((step_index / total_steps) * 100);
    setConfigurationLog((prev) => {
      const rest = prev.filter((el) => el.imei !== imei);
      const current = prev.find((el) => el.imei === imei);
      const result = rest.concat({
        ...(current ?? { imei }),
        label: step_label,
        progress: percentage,
      });
      return result;
    });
  };
  const updateIdentifiedLog = (input: {
    step_label: string;
    step_index: number;
    port: ISerialPort;
    total_steps: number;
  }) => {
    const { port, total_steps, step_index, step_label } = input;
    const percentage = Math.round((step_index / total_steps) * 100);
    setIdentifiedLog((prev) => {
      const rest = prev.filter((el) => el.port !== port);
      const current = prev.find((el) => el.port === port);
      const result = rest.concat({
        ...(current ?? { port }),
        label: step_label,
        progress: percentage,
      });
      return result;
    });
  };

  const handleForgetPort = async (port: ISerialPort) => {
    await forgetPort(port);
    setIdentified((prev) => {
      const _identified = prev.find((el) => el.port === port);
      const updatedIdentified = prev.filter((el) => el.port !== port);
      setIdentifiedLog((prevLog) => prevLog.filter((el) => el.port !== port));
      setConfigurationLog((prevLog) =>
        prevLog.filter((el) => el.imei !== _identified?.imei)
      );
      setConfiguration((prevConfig) =>
        prevConfig.filter((el) => el.imei !== _identified?.imei)
      );
      return updatedIdentified;
    });
  };

  useEffect(() => {
    const newPorts = ports.filter(
      (port) => !previousPorts.current.includes(port)
    );

    if (newPorts.length > 0) {
      handleDeviceIdentification(newPorts);
    }

    previousPorts.current = ports;
  }, [ports]);

  useEffect(() => {
    if (isConfigurationDisabled && configurationDisabledTimer > 0) {
      countdownTimeout = setTimeout(() => {
        setConfigurationDisabledTimer(configurationDisabledTimer - 1);
      }, 1000);
    }
  }, [isConfigurationDisabled, configurationDisabledTimer]);

  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     if (inConfiguration) return
  //     handleDeviceIdentification(ports)
  //   }, 5000)
  //   return () => clearInterval(interval)
  // }, [ports, inConfiguration])

  return {
    identified,
    requestPort,
    ports,
    getDeviceProfile,
    handleDeviceConfiguration,
    configuration,
    configurationLog,
    identifiedLog,
    inConfiguration,
    inIdentification,
    handleForgetPort,
    isConfigurationDisabled,
    configurationDisabledTimer,
  };
}
