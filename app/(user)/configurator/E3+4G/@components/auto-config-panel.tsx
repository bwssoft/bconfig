"use client";

import { IProfile, IUser } from "@/app/lib/definition";
import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import DeviceConfiguredTable from "@/app/ui/tables/devices-configured/table";
import DevicesToConfigureTable from "@/app/ui/tables/devices-to-configure/table";
import { jsonToXlsx } from "@/app/lib/util/json-to-xlsx";
import { IdentificationProgress } from "@/app/ui/components/identification-progress";
import { ConfigurationProgress } from "@/app/ui/components/configuration-progress";
import { useE34GCommunication } from "@/app/hook/use-E34G-communication";
import { toast } from "@/app/hook/use-toast";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Dialog } from "@/app/ui/components/dialog";
import { cn } from "@/app/lib/util";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { DialogTitle } from "@headlessui/react";
import { useRouter } from "next/navigation";
import { revalidate } from "@/app/lib/action";

interface Props {
  profile?: IProfile;
  user_type: IUser["type"];
}

export function AutoConfigPanel(props: Props) {
  const router = useRouter();
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
  } = useE34GCommunication();

  const [wrongImeiDetected, setWrongImeiDetected] = useState<boolean>(false);

  useEffect(() => {
    const wrong_imei = identified.some((el) => el.imei?.startsWith("86"));
    if (wrong_imei) {
      setWrongImeiDetected(wrong_imei);
    } else if (profile && !inConfiguration) {
      handleDeviceConfiguration(identified, profile, false);
    }
  }, [identified, profile]);

  useEffect(() => {
    return () => revalidate("/configuration-log");
  }, []);

  const handleExport = (input: typeof configuration) => {
    jsonToXlsx({
      data: input.map((c) => ({
        configurado: c.is_configured ? "Sucesso" : "Falha",
        imei: c.imei,
        iccid: c.iccid,
        et: c.et,
        check: c.actual_native_profile?.check,
        cxip: c.actual_native_profile?.cxip,
        dns: c.actual_native_profile?.dns,
      })),
      fileName: new Date().toLocaleTimeString(),
      sheetName: "Dispositivos Configurados",
    });
  };

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
                <IdentificationProgress
                  identifiedLog={identifiedLog}
                  inIdentification={inIdentification}
                />
                <DevicesToConfigureTable
                  model={"E3+4G" as IProfile["model"]}
                  data={identified.map((d) => ({
                    ...d,
                    getDeviceProfile,
                    handleForgetPort,
                    progress: identifiedLog.find((el) => el.port === d.port)
                      ?.progress,
                  }))}
                />
              </>
            ) : (
              <Alert variant="info" title="Você não tem nenhuma porta." />
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
      <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Etapa 4: Exportar resultados
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Uma planilha excel é gerada com todos os equipamentos configurados
            com sucesso.
          </p>
        </div>
        <Button
          variant="outlined"
          className="w-fit"
          onClick={() => handleExport(configuration)}
        >
          Exportar
        </Button>
      </div>

      {wrongImeiDetected && (
        <Dialog
          open={wrongImeiDetected}
          setOpen={(value) => {
            if (!value) {
              setWrongImeiDetected(false);
              router.push(`/imei-writer/E3+4G`);
            } else {
              setWrongImeiDetected(true);
            }
          }}
        >
          <div>
            <div
              className={cn(
                "mx-auto flex size-12 items-center justify-center rounded-full bg-red-100"
              )}
            >
              <XMarkIcon aria-hidden="false" className="size-6 text-red-600" />
            </div>
            <div className="mt-3 text-center sm:mt-5">
              <DialogTitle
                as="h3"
                className="text-base font-semibold text-gray-900"
              >
                IMEI Inválido
              </DialogTitle>
              <div className="mt-2">
                <p className="text-sm text-gray-500">
                  Não é permitido configurar equipamento com esse IMEI.
                </p>
              </div>
            </div>
          </div>
          <div className="mt-5 sm:mt-6">
            <button
              type="button"
              onClick={() => {
                setWrongImeiDetected(false);
                router.push(`/imei-writer/E3+4G`);
              }}
              className="inline-flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 sm:col-start-2"
            >
              Ok
            </button>
          </div>
        </Dialog>
      )}
    </>
  );
}
