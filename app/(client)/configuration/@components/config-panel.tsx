"use client";
import { useE34GCommunication } from "@/app/hook/use-E34G-communication";
import { IProfile, IUser } from "@/app/lib/definition";
import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import { ConfigurationProgress } from "@/app/ui/components/configuration-progress";
import { IdentificationProgress } from "@/app/ui/components/identification-progress";
import { Spinner } from "@/app/ui/components/spinner";
import { E34GClientProfileForm } from "@/app/ui/forms/profile/client/client-e34g-profile.form";
import DeviceConfiguredTable from "@/app/ui/tables/devices-configured/table";
import DevicesToConfigureTable from "@/app/ui/tables/devices-to-configure/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@bwsoft/accordion";

interface Props {
  current_profile?: IProfile;
  profiles: IProfile[];
  user_type: IUser["type"];
}

export function ConfigPanel(props: Props) {
  const { current_profile, profiles, user_type } = props;
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
  } = useE34GCommunication();

  return (
    <div className="flex flex-col justify-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 relative">
      <E34GClientProfileForm
        profiles={profiles}
        current_profile={current_profile}
        onSubmit={async (profile) => {
          await handleDeviceConfiguration(identified, profile as IProfile);
        }}
      />
      <div className="bg-white rounded-xl sticky bottom-5 w-full shadow-2xl p-5 ring-1 ring-inset ring-gray-300 animate-bounce-limited">
        <Accordion type="multiple" defaultValue={["configuration"]}>
          <AccordionItem
            value="configuration"
            id="configuration"
            itemID="configuration"
          >
            <AccordionTrigger>
              <div className="flex justify-between gap-4">
                <p>Acompanhe a sua configuração</p>
                <div>
                  {inIdentification ? (
                    <p className="text-sm text-gray-700 flex gap-2">
                      <Spinner svgClassName="h-4 w-4 fill-gray-600" />
                      Indentificando os equipamentos
                    </p>
                  ) : (
                    <></>
                  )}

                  {inConfiguration ? (
                    <p className="text-sm text-gray-700 flex gap-2">
                      <Spinner svgClassName="h-4 w-4 fill-gray-600" />
                      Configurando os equipamentos
                    </p>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="flex flex-col gap-2">
              <div className="flex justify-between">
                <div>
                  <h1
                    id="applicant-information-title"
                    className="text-base font-semibold leading-7 text-gray-900"
                  >
                    Tabela com os equipamentos que serão configurados
                  </h1>
                  <p className="text-sm text-gray-700">
                    Cada linha apresenta o imei, iccid e firmware do
                    equipamento.
                  </p>
                </div>
                <div>
                  <Button
                    variant="primary"
                    className="h-fit whitespace-nowrap"
                    onClick={requestPort}
                  >
                    Requisitar porta usb
                  </Button>
                </div>
              </div>
              {ports.length > 0 ? (
                <>
                  <IdentificationProgress
                    identifiedLog={identifiedLog}
                    inIdentification={inIdentification}
                  />
                  <DevicesToConfigureTable
                    model={"E3+4G" as IProfile["model"]}
                    data={identified.map((d) => ({
                      ...d,
                      getDeviceProfile,
                      progress: identifiedLog.find((el) => el.port === d.port)
                        ?.progress,
                      handleForgetPort,
                    }))}
                  />
                </>
              ) : (
                <Alert
                  variant="info"
                  title="Você não tem nenhuma porta ativa. Aperte o botão 'Requisitar porta usb' e escolha alguma das opções"
                />
              )}

              {configurationLog.length > 0 ? (
                <>
                  <div>
                    <h1 className="text-base font-semibold leading-7 text-gray-900">
                      Verificação
                    </h1>
                    <p className="mt-2 text-sm text-gray-700">
                      Uma lista de todos os equipamentos configurados e os
                      comandos enviados.
                    </p>
                  </div>
                  <ConfigurationProgress
                    configurationLog={configurationLog}
                    inConfiguration={inConfiguration}
                  />
                  <DeviceConfiguredTable
                    data={configuration}
                    user_type={user_type}
                  />
                </>
              ) : (
                <></>
              )}
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}
