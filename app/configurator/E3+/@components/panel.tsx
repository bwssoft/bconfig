"use client";

import { IProfile } from "@/app/lib/definition";
import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import DeviceConfiguredTable from "@/app/ui/tables/devices-configured/table";
import DevicesToConfigureTable from "@/app/ui/tables/devices-to-configure/table";
import { useE3Communication } from "@/app/hook/use-E3-communication";
import { ConfigurationProgress } from "@/app/ui/components/configuration-progress";

interface Props {
  profile?: IProfile;
}

export function Panel(props: Props) {
  const { profile } = props;
  const { config } = profile ?? {};
  const {
    configuration,
    identified,
    requestPort,
    handleDeviceConfiguration,
    getDeviceProfile,
    configurationLog,
    identifiedLog,
    ports,
    inIdentification,
    inConfiguration,
  } = useE3Communication({ profile });

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
              <>
                {/* <IdentificationProgress
                  identifiedLog={identifiedLog}
                  inIdentification={inIdentification}
                /> */}
                <DevicesToConfigureTable
                  model={"E3+" as IProfile["model"]}
                  data={identified.map((d) => ({
                    ...d,
                    getDeviceProfile,
                    progress: identifiedLog.find((el) => el.port === d.port)
                      ?.progress,
                  }))}
                  // data={identifiedLog.map((d) => ({
                  //   ...d,
                  //   getDeviceProfile,
                  //   ...(identified.find((el) => el.port === d.port) ?? {}),
                  // }))}
                />
              </>
            ) : (
              <Alert label="Você não tem nenhuma porta." />
            )}
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="h-fit"
                disabled={inConfiguration}
                onClick={() =>
                  config && handleDeviceConfiguration(identified, config)
                }
              >
                Configurar
              </Button>
            </div>

            <Button
              variant="outlined"
              className="h-fit whitespace-nowrap"
              onClick={requestPort}
            >
              Nova Porta
            </Button>
          </div>
        </div>
      </div>
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
        <ConfigurationProgress
          configurationLog={configurationLog}
          inConfiguration={inConfiguration}
        />
        <DeviceConfiguredTable data={configuration} />
      </div>
    </>
  );
}
