import { Configuration } from "@/app/hook/use-E33-communication";
import CommandLogTable from "../../tables/command-log/table";
import { configMapped } from "@/app/constants/e3+config";
import { cn } from "@/app/lib/util";

interface Props {
  config: Configuration;
}

const statuses = {
  progress: "text-gray-500 bg-gray-800/20",
  configured: "text-green-500 bg-green-800/20",
  error: "text-rose-500 bg-rose-800/20",
};

const text = {
  progress: "text-gray-800",
  configured: "text-green-800",
  error: "text-rose-800",
};

export function ViewConfigurationForm(props: Props) {
  const { config } = props;
  const {
    imei,
    iccid,
    et,
    isConfigured,
    metadata,
    not_configured,
    actual_native_profile,
  } = config;
  const not_configured_mapped = Object.keys(not_configured).map(
    (c) => configMapped[c as keyof typeof configMapped]
  );
  const status = isConfigured ? "configured" : "error";
  const label = isConfigured ? "Configurado" : "Não Configurado";
  return (
    <form autoComplete="off" className="flex flex-col gap-6 mt-6">
      <section aria-labelledby="general-config">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Identificação
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Detalhes do equipamento e suas configurações.
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-full">
                <div className="grid grid-cols-3 gap-x-4 gap-y-8 mt-2 flex-1">
                  <div className="px-4 sm:px-0 sm:grid-cols-1">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Imei
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {imei}
                    </dd>
                  </div>
                  <div className="px-4 sm:px-0 sm:grid-cols-1">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Iccid
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {iccid ?? "--"}
                    </dd>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Firmware
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {et ?? "--"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="general-config">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Resultados da configuração
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Detalhes sobre cada comando enviado para o equipamento
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Status
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    <div className="flex items-center gap-1">
                      <div
                        className={cn(
                          statuses[status],
                          "flex-none rounded-full p-1"
                        )}
                      >
                        <div className="h-1.5 w-1.5 rounded-full bg-current" />
                      </div>
                      <div
                        className={cn(
                          "hidden font-semibold sm:block",
                          text[status]
                        )}
                      >
                        {label}
                      </div>
                    </div>
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Campos que não foram configurados
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {not_configured_mapped.length > 0
                      ? not_configured_mapped.join(", ")
                      : "Nenhum"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Tabela de comandos
                  </dt>
                  <dd className="mt-1 ">
                    <CommandLogTable data={metadata.commands_sent} />
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="general-config">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Dados brutos pós configuração
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Resposta do equipamento para os comandos de consulta após o
              termino da configuração
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Check
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {actual_native_profile?.check ?? "_-"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Cxip
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {actual_native_profile?.cxip ?? "_-"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Dns
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {actual_native_profile?.dns ?? "_-"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </form>
  );
}
