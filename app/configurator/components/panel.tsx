"use client";

import { IProfile } from "@/app/lib/definition";
import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import DeviceConfiguredTable from "@/app/ui/tables/devices-configured/table";
import DevicesToConfigureTable from "@/app/ui/tables/devices-to-configure/table";
import { useE3Communication } from "@/app/hook/use-e3-communication";
import { IdentificationProgress } from "./identification-progress";
import { ConfigurationProgress } from "./configuration-progress";
import { jsonToXlsx } from "@/app/lib/util/json-to-xlsx";

interface Props {
  config?: IProfile["config"];
}

export function Panel(props: Props) {
  const { config } = props;
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
  } = useE3Communication();

  const handleExport = (input: typeof configuration) => {
    jsonToXlsx({
      data: input.map((c) => ({
        imei: c.imei,
        iccid: c.iccid,
        check: c.actual_native_profie?.check,
        cxip: c.actual_native_profie?.cxip,
        dns: c.actual_native_profie?.dns,
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
                  data={identified.map((d) => ({ ...d, getDeviceProfile }))}
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
                onClick={() =>
                  config && handleDeviceConfiguration(identified, config)
                }
              >
                Configurar
              </Button>
              <Button variant="outlined" className="h-fit">
                Logs
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
    </>
  );
}
