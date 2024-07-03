"use client";
import { useE3Communication } from "@/app/hook/use-e3-communication";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "@/app/lib/util";
import { Button } from "../../components/button";
import Alert from "../../components/alert";
import { additionalFunctions } from "@/app/constants/e3+config";

const icons = {
  open: { icon: CheckIcon, bgColorClass: "bg-green-500" },
  close: { icon: XMarkIcon, bgColorClass: "bg-gray-400" },
};

export function E3Config() {
  const { identified, requestPort, ports } = useE3Communication();
  const date = new Date();
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
        <div className="mx-auto mt-8 grid max-w-3xl grid-cols-1 gap-6 sm:px-6 lg:max-w-7xl lg:grid-flow-col-dense lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2 lg:col-start-1">
            <div className="col-span-full flex flex-col gap-6">
              <section aria-labelledby="communication">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2
                      id="applicant-information-title"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Comunicação
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Detalhes do equipamento e suas configurações.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          APN
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          bws.com.br
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Intervalo de Transmissão (Segundos)
                        </dt>
                        <div className="flex gap-2">
                          <dd className="mt-1 text-sm text-gray-900">
                            Ligado: 60
                          </dd>
                          <dd className="mt-1 text-sm text-gray-900">
                            Desligado: 60
                          </dd>
                        </div>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Ip Primário
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          143.198.247.1:2000
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Ip Secundário
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          143.198.247.2:2000
                        </dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              <section aria-labelledby="general-config">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2
                      id="applicant-information-title"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Configurações Gerais
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Detalhes do equipamento e suas configurações.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Sensor Acelerômetro
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">3</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Tipo de Bloqueio
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          Progressivo
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Fuso Horário
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">
                          UTC+00:00
                        </dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Sleep (Minutos)
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">1</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Ajuste Sensibilidade
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">500</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Ajuste Sensibilidade
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">500</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Tempo TX
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">60</dd>
                      </div>
                      <div className="sm:col-span-1">
                        <dt className="text-sm font-medium text-gray-500">
                          Hodômetro (Km)
                        </dt>
                        <dd className="mt-1 text-sm text-gray-900">60</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </section>

              <section aria-labelledby="additional-functions">
                <div className="bg-white shadow sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6">
                    <h2
                      id="applicant-information-title"
                      className="text-lg font-medium leading-6 text-gray-900"
                    >
                      Funções Adicionais
                    </h2>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">
                      Detalhes do equipamento e suas configurações.
                    </p>
                  </div>
                  <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                    <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
                      {additionalFunctions.map((prop, id) => (
                        <div
                          key={id}
                          className="relative flex items-start py-4"
                        >
                          <div className="min-w-0 flex-1 text-sm leading-6">
                            <label
                              htmlFor={`person-${prop.id}`}
                              className="select-none font-medium text-gray-900"
                            >
                              {prop.name}
                            </label>
                          </div>
                          <div className="ml-3 flex h-6 items-center">
                            <input
                              id={`person-${prop.id}`}
                              name={`person-${prop.id}`}
                              type="checkbox"
                              className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </section>
            </div>
          </div>
          <section className="lg:col-span-1 lg:col-start-3">
            {/* <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
              <DevicesToConfigureTable data={identified} />
            </div> */}

            <div className="bg-white px-4 py-5 shadow sm:rounded-lg sm:px-6">
              <h2
                id="timeline-title"
                className="text-lg font-medium text-gray-900"
              >
                Portas
              </h2>
              <div className="mt-6 flow-root">
                {ports.length > 0 ? (
                  <ul role="list" className="-mb-8">
                    {ports.map((item, itemIdx) => {
                      const { readable, writable } = item;
                      const isOpen = readable && writable;
                      const info = item.getInfo();
                      const random = Math.random();
                      const device = identified.find((el) => el.port === item);
                      return (
                        <li key={random}>
                          <div className="relative pb-8">
                            {itemIdx !== ports.length - 1 ? (
                              <span
                                className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-gray-200"
                                aria-hidden="true"
                              />
                            ) : null}
                            <div className="relative flex space-x-3 items-center">
                              <span
                                className={cn(
                                  isOpen
                                    ? icons.open.bgColorClass
                                    : icons.close.bgColorClass,
                                  "flex h-8 w-8 items-center justify-center rounded-full ring-8 ring-white"
                                )}
                              >
                                {isOpen ? (
                                  <icons.open.icon
                                    className="h-5 w-5 text-white"
                                    aria-hidden="true"
                                  />
                                ) : (
                                  <icons.close.icon
                                    className="h-5 w-5 text-white"
                                    aria-hidden="true"
                                  />
                                )}
                              </span>
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-1.5 items-center">
                                <p className="text-sm text-gray-500">
                                  {info?.usbProductId}{" "}
                                  <a
                                    href="#"
                                    className="font-medium text-gray-900"
                                  >
                                    {device?.imei ?? info?.usbVendorId}
                                  </a>
                                </p>
                                <div className="flex whitespace-nowrap text-right text-sm text-gray-500 gap-2">
                                  {/* <Button type="submit" variant="outlined">
                                    {isOpen ? "Fechar" : "Abrir"}
                                  </Button> */}
                                  <Button type="button" variant="outlined">
                                    Configuração
                                  </Button>
                                  {/* <form
                                    id="handle-forget-port"
                                    action={() => item.forget()}
                                  >
                                    <Button type="submit" variant="outlined">
                                      Esquecer
                                    </Button>
                                  </form> */}
                                </div>
                              </div>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <Alert label="Você não tem nenhuma porta registrada. Aberte o botão abaixo e escolha uma." />
                )}
              </div>
              <div className="mt-6 flex flex-col justify-stretch gap-3">
                <form
                  id="request-new-port"
                  action={requestPort}
                  className="w-full"
                >
                  <Button type="submit" variant="primary" className="w-full">
                    Requisitar nova porta
                  </Button>
                </form>
              </div>
            </div>
          </section>

          {/* <pre>
            {JSON.stringify(
              log.map((l) => ({ ...l, port: l.port.getInfo().usbProductId })),
              null,
              2
            )}
          </pre> */}
        </div>
      </div>
    </main>
  );
}
