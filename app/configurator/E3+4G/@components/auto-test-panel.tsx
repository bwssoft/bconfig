"use client";

import Alert from "@/app/ui/components/alert";
import { Button } from "@/app/ui/components/button";
import { useE34GAutoTest } from "@/app/hook/use-E34G-auto-test";
import DevicesToAutoTest from "@/app/ui/tables/devices-to-auto-test/table";
import { cn } from "@/app/lib/util";

export function AutoTestPanel() {
  const { identified, requestPort, handleDeviceAutoTest, ports, test, inTest } =
    useE34GAutoTest();

  return (
    <>
      <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Etapa 1: Portas
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Uma lista de todas as portas conectadas vinculadas ao equipamento
            identificado
          </p>
        </div>
        <div className="flex flex-col gap-6 w-full">
          <div className="flow-root w-full">
            {ports.length > 0 ? (
              <DevicesToAutoTest data={identified} />
            ) : (
              <Alert label="Você não tem nenhuma porta." />
            )}
          </div>
          <div className="flex justify-between gap-2">
            <div className="flex gap-2">
              <Button
                disabled={inTest}
                variant="primary"
                className="h-fit"
                onClick={() => handleDeviceAutoTest(identified)}
              >
                Auto Test
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
            Etapa 2: Verificação
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Uma lista com o resultado do auto teste para todos equipamentos
            conectados.
          </p>
        </div>
        <div className="flex flex-wrap gap-4">
          {test.length > 0 ? (
            <>
              {test.map((t, i) => (
                <div
                  className="flex flex-col p-4 max-w-96 bg-white shadow-lg rounded-lg"
                  key={i}
                >
                  {/* Serial and Device Info */}
                  <div className="grid grid-cols-1 gap-4">
                    <div className="p-4 rounded-lg">
                      <h3 className="font-semibold text-sm text-gray-700">
                        Identificação do Equipamento
                      </h3>
                      <div className="mt-4 flex items-center gap-2">
                        <div className="w-full">
                          <dt className="text-sm font-medium leading-6 text-gray-900">
                            Número serial
                          </dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700">
                            {t.imei?.length ? t.imei : "--"}
                          </dd>
                        </div>
                        <div className="w-full">
                          <dt className="text-sm font-medium leading-6 text-gray-900">
                            ICCID
                          </dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700">
                            {t.iccid?.length ? t.iccid : "--"}
                          </dd>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="w-full">
                          <dt className="text-sm font-medium leading-6 text-gray-900">
                            Firmware
                          </dt>
                          <dd className="mt-1 text-sm leading-6 text-gray-700">
                            {t.et?.length ? t.et : "--"}
                          </dd>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Tests Status */}
                  <div className="p-4 rounded-lg">
                    <h3 className="font-semibold text-sm text-gray-700">
                      Resultado
                    </h3>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                      {[
                        ["SIM HW", "IC"],
                        ["GPS HW", "GPS"],
                        ["GPS Signal", "GPSf"],
                        ["GSM", "GSM"],
                        ["LTE Signal", "LTE"],
                        ["IN 1", "IN1"],
                        ["IN 2", "IN2"],
                        ["OUT 1", "OUT"],
                        ["ACEL HW", "ACEL"],
                        ["VCC", "VCC"],
                      ].map((label) => (
                        <div
                          key={label[0]}
                          className="flex items-center space-x-2"
                        >
                          <div
                            className={cn(
                              "w-5 h-5 rounded-full",
                              t.auto_test_analysis[
                                label[1] as keyof typeof t.auto_test_analysis
                              ]
                                ? "bg-green-400"
                                : "bg-red-400"
                            )}
                          ></div>
                          <span className="text-xs text-gray-700">
                            {label[0]}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <Alert label="Você não tem nenhum resultado." />
          )}
        </div>
      </div>
    </>
  );
}
