"use client";
import Alert from "../../components/alert";
import { ConfigE3Form } from "../../forms/config-e3";
import { useE3CommunicationTest } from "@/app/hook/use-e3-communication-test";
import ConfigurationLogTable from "../../tables/configuration-log/table";
import Disclosure from "../../components/disclosure";
import DevicesToConfigureTable from "../../tables/devices-to-configure/table";
import { Button } from "../../components/button";

export function E3Config() {
  const {
    identified,
    requestPort,
    ports,
    sendCommandsToPorts,
    commands,
    getDeviceConfig,
    config,
  } = useE3CommunicationTest();
  const date = new Date();
  const handleSubmit = async (commands: string[]) => {
    await sendCommandsToPorts(ports, commands);
  };
  return (
    <main className="py-10">
      {/* Page header */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 md:flex md:items-center md:justify-between md:space-x-5 lg:max-w-7xl lg:px-8">
        <div className="flex items-center space-x-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Configurador</h1>
            <p className="text-sm font-medium text-gray-500">
              Possivel configurar a{" "}
              <a href="#" className="text-gray-900">
                Família E3.
              </a>{" "}
              Data de hoje:{" "}
              <time dateTime={date.toLocaleDateString()}>
                {date.toLocaleDateString()}
              </time>
            </p>
          </div>
        </div>
      </div>
      <div>
        <div className="mx-auto mt-8 grid gap-6 sm:px-6 lg:max-w-7xl lg:grid-cols-1">
          <div className="space-y-6 col-span-full">
            <div className="col-span-full">
              <ConfigE3Form config={config?.config} onSubmit={handleSubmit} />
              {commands.length > 0 && (
                <Disclosure
                  items={identified.map((i) => ({
                    label: i.imei ?? "não reportou o imei",
                    content: (
                      <ConfigurationLogTable
                        data={commands.filter((el) => el.port === i.port)}
                      />
                    ),
                  }))}
                />
              )}
            </div>
          </div>
        </div>
        <section className="sticky bottom-5 mx-auto max-w-7xl">
          <div className="bg-gray-900/5 backdrop-blur-sm rounded-lg p-6 w-full gap-3">
            <div className="bg-white shadow-xl sm:rounded-lg p-3 gap-3 grid grid-rows-[min-content_1fr]">
              <div className="flex justify-between">
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
                  <Button variant="primary" className="h-fit">
                    Configurar
                  </Button>
                </div>
              </div>
              <div className="flow-root">
                {ports.length > 0 ? (
                  <DevicesToConfigureTable
                    data={ports.map((port) => {
                      const _identified = identified.find(
                        (el) => el.port === port
                      );
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
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
