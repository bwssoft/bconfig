import CommandLogTable from "@/app/ui/tables/command-log/table";
import { cn } from "@/app/lib/util";
import { IAutoTestLog } from "@/app/lib/definition";
import { StatusBadge } from "../../components/status-badge";

interface Props {
  auto_test: IAutoTestLog;
}

export function E34GViewAutoTestForm(props: Props) {
  const { auto_test } = props;
  const { imei, iccid, et, is_successful, metadata } = auto_test;
  const status = is_successful ? "success" : "error";
  const label = is_successful ? "Sucesso" : "Falha";
  return (
    <form autoComplete="off" className="flex flex-col gap-6 mt-6">
      <section aria-labelledby="identification">
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

      <section aria-labelledby="details">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Resultados do auto teste
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
                    <StatusBadge
                      status={status}
                      label={label}
                      iconClassname="h-3 w-3"
                    />
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Detalhes
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {[
                        ["SIM HW", "SIMHW"],
                        ["GPS HW", "GPS"],
                        // ["GPS Signal", "GPSf"],
                        // ["GSM", "GSM"],
                        // ["LTE Signal", "LTE"],
                        ["IN 1", "IN1"],
                        ["IN 2", "IN2"],
                        ["OUT 1", "OUT"],
                        ["ACEL HW", "ACEL"],
                        ["VCC", "VCC"],
                        ["CHARGER", "CHARGER"],
                        ["MEM", "MEM"],
                      ].map((label) => (
                        <StatusBadge
                          key={label[1]}
                          status={
                            auto_test.auto_test_analysis[
                              label[1] as keyof typeof auto_test.auto_test_analysis
                            ]
                              ? "success"
                              : "error"
                          }
                          label={label[0]}
                          iconClassname="h-3 w-3"
                        />
                      ))}
                    </div>
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Dados Brutos
                  </dt>
                  <dd className="mt-1">
                    {metadata.commands_sent.map((c, cindex) => (
                      <div className="w-full" key={cindex}>
                        <dt className="text-sm font-medium leading-6 text-gray-900">
                          {c.request}
                        </dt>
                        <dd className="mt-1 text-sm leading-6 text-gray-700 break-words">
                          {c.response ?? "--"}
                        </dd>
                      </div>
                    ))}
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
