"use client";

import { IProfile, IUser } from "@/app/lib/definition";
import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import DeviceConfiguredTable from "@/app/ui/tables/devices-configured/table";
import DevicesToConfigureTable from "@/app/ui/tables/devices-to-configure/table";
import { useE3Communication } from "@/app/hook/use-E3-communication";
import { ConfigurationProgress } from "@/app/ui/components/configuration-progress";
import { toast } from "@/app/hook/use-toast";

interface Props {
  profile?: IProfile;
  user_type: IUser["type"];
}

export function Panel(props: Props) {
  const { profile, user_type } = props;
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
    handleForgetPort,
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
                    handleForgetPort,
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
              <Alert variant="info" title="Você não tem nenhuma porta." />
            )}
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button
                variant="primary"
                className="h-fit"
                disabled={inConfiguration}
                onClick={() => {
                  ports.length ? 
                  profile &&
                  Object.keys(profile).length > 0 &&
                  handleDeviceConfiguration(identified, profile) 
                  : toast({
                    title: "Erro de Configuração",
                    description: "Nenhuma porta está disponível ou o equipamento está desconectado. Verifique a conexão e tente novamente.",
                    variant: "error",
                    className: "destructive group border bg-red-500 border-red-400 text-white"
                  });
                }
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
        <DeviceConfiguredTable data={configuration} user_type={user_type} />
      </div>
    </>
  );
}
