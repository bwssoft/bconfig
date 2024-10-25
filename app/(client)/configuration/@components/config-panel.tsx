"use client";
import { useE34GCommunication } from "@/app/hook/use-E34G-communication";
import { IProfile } from "@/app/lib/definition";
import { ConfigurationProgress } from "@/app/ui/components/configuration-progress";
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
}

export function ConfigPanel(props: Props) {
  const { current_profile, profiles } = props;
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
  } = useE34GCommunication({ profile: current_profile });

  return (
    <div className="flex flex-col justify-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 relative">
      <E34GClientProfileForm
        profiles={profiles}
        current_profile={current_profile}
        onSubmit={async () => {
          current_profile &&
            Object.keys(current_profile).length > 0 &&
            (await handleDeviceConfiguration(identified, current_profile));
        }}
      />
      <div className="bg-white rounded-xl sticky bottom-5 w-full shadow-2xl p-5">
        <Accordion type="multiple">
          <AccordionItem value="value">
            <AccordionTrigger>Ver detalhes</AccordionTrigger>
            <AccordionContent>
              <div>
                <h1
                  id="applicant-information-title"
                  className="text-base font-semibold leading-7 text-gray-900"
                >
                  Tabela com os equipamentos que serão configurados
                </h1>
                <p className="mt-2 text-sm text-gray-700">
                  Cada linha apresenta o imei, iccid e firmware do equipamento.
                </p>
              </div>
              <DevicesToConfigureTable
                model={"E3+4G" as IProfile["model"]}
                data={identified.map((d) => ({
                  ...d,
                  getDeviceProfile,
                  progress: identifiedLog.find((el) => el.port === d.port)
                    ?.progress,
                }))}
              />
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
                  <DeviceConfiguredTable data={configuration} />
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
