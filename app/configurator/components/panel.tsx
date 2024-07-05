"use client";

import { useE3CommunicationTest } from "@/app/hook/use-e3-communication-test";
import { IProfile } from "@/app/lib/definition";
import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import { useConfigE3Form } from "@/app/ui/forms/use-config-e3.form";
import DevicesToConfigureTable from "@/app/ui/tables/devices-to-configure/table";

interface Props {
  config?: IProfile["config"];
}
export function Panel(props: Props) {
  const { config } = props;
  const {
    identified,
    requestPort,
    ports,
    sendCommandsToPorts,
    getDeviceConfig,
  } = useE3CommunicationTest();

  const { handleSubmit } = useConfigE3Form({
    defaultValues: config,
    onSubmit: async (commands: string[]) => {
      await sendCommandsToPorts(ports, commands);
    },
  });

  return (
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
                const _identified = identified.find((el) => el.port === port);
                return {
                  port,
                  imei: _identified?.imei,
                  iccid: _identified?.iccid,
                  et: _identified?.et,
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
              onClick={() => handleSubmit()}
            >
              Configurar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
