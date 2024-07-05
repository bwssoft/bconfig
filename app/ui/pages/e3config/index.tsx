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
          <div className="bg-blue-500/5 backdrop-blur-sm rounded-lg p-6 w-full gap-3 grid grid-cols-[1fr_min-content]">
            <div className="bg-white px-4 py-3 shadow-xl sm:rounded-lg sm:px-6 ">
              {/* <h2
              id="timeline-title"
              className="text-lg font-medium text-gray-900"
            >
              Portas
            </h2> */}
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
                  <Alert label="Você não tem nenhuma porta registrada. Aberte o botão abaixo e escolha uma." />
                )}
              </div>
              {/* <div className="mt-6 flex flex-col justify-stretch gap-3">
              <form
                id="request-new-port"
                action={requestPort}
                className="w-full"
              >
                <Button type="submit" variant="primary" className="w-full">
                  Requisitar nova porta
                </Button>
              </form>
            </div> */}
            </div>
            <div className="bg-white shadow-xl sm:rounded-lg p-3 flex flex-col gap-3">
              <Button
                variant="outlined"
                className="w-full h-fit whitespace-nowrap"
                onClick={requestPort}
              >
                Requisita Nova Porta
              </Button>
              <Button variant="primary" className="w-full h-fit">
                Configurar
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
