"use client";

import { IProfile } from "@/app/lib/definition";
import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import ConfigurationTable from "@/app/ui/tables/configuration-log/table";
import DevicesToConfigureTable from "@/app/ui/tables/devices-to-configure/table";
import CommandLogTable from "@/app/ui/tables/command-log/table";
import { useE3Communication } from "@/app/hook/use-e3-communication";

interface Props {
  config?: IProfile["config"];
}

export function Panel(props: Props) {
  const { config } = props;
  const {
    configurations,
    deviceIdentified,
    requestPort,
    handleDeviceConfiguration,
    getDeviceConfig,
    ports,
  } = useE3Communication();

  return (
    <>
      <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Etapa 2: Portas
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Uma lista de todas as portas conectadas vinculadas ao equipamento
            identificado
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <div className="flow-root w-full">
            {ports.length > 0 ? (
              <DevicesToConfigureTable
                data={ports.map((port) => {
                  const _deviceIdentified = deviceIdentified.find(
                    (el) => el.port === port
                  );
                  return {
                    port,
                    imei: _deviceIdentified?.imei,
                    iccid: _deviceIdentified?.iccid,
                    et: _deviceIdentified?.et,
                    getDeviceConfig,
                  };
                })}
              />
            ) : (
              <Alert label="Você não tem nenhuma porta." />
            )}
          </div>
          <div className="flex justify-between gap-2">
            <Button
              variant="outlined"
              className="h-fit whitespace-nowrap"
              onClick={requestPort}
            >
              Nova Porta
            </Button>
            <div className="flex gap-2">
              <Button variant="outlined" className="h-fit">
                Logs
              </Button>

              <Button
                variant="primary"
                className="h-fit"
                onClick={() =>
                  config && handleDeviceConfiguration(ports, config)
                }
              >
                Configurar
              </Button>
            </div>
          </div>
        </div>
      </div>
      {configurations.length ? (
        <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
          <div>
            <h1 className="text-base font-semibold leading-7 text-gray-900">
              Etapa 3: Verificação
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Uma lista de todos os equipamentos configurados e os comandos
              enviados.
            </p>
          </div>
          <div className="flex flex-col gap-6 w-full">
            <ConfigurationTable
              data={configurations.map((c) => {
                const _deviceIdentified = deviceIdentified.find(
                  (i) => i.port === c.port
                );
                return {
                  ...c,
                  ..._deviceIdentified,
                };
              })}
            />
            {deviceIdentified.map((i, idx) => {
              return (
                <div key={idx}>
                  <CommandLogTable
                    data={
                      configurations.filter(
                        (el: any) => el.port === i.port
                      )?.[0]?.metadata.commands_sent ?? []
                    }
                  />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
