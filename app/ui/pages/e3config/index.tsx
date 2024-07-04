"use client";
import { useE3Communication } from "@/app/hook/use-e3-communication";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import { cn } from "@/app/lib/util";
import { Button } from "../../components/button";
import Alert from "../../components/alert";
import { ConfigE3Form } from "../../forms/config-e3";

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
            <div className="col-span-full">
              <ConfigE3Form config={identified[0]?.config} />
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
                              <div className="flex min-w-0 flex-1 justify-between space-x-4 items-center">
                                {device?.imei || device?.iccid ? (
                                  <p className="text-sm text-gray-500 flex flex-col">
                                    {/* {info?.usbProductId}{" "} */}
                                    <a
                                      href="#"
                                      className="font-medium text-gray-900"
                                    >
                                      {device?.imei}
                                    </a>
                                    {device?.iccid}
                                  </p>
                                ) : (
                                  <>
                                    <div className="flex items-center gap-2">
                                      <div role="status">
                                        <svg
                                          aria-hidden="true"
                                          className="w-8 h-8 text-gray-200 animate-spin fill-blue-600"
                                          viewBox="0 0 100 101"
                                          fill="none"
                                          xmlns="http://www.w3.org/2000/svg"
                                        >
                                          <path
                                            d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                                            fill="currentColor"
                                          />
                                          <path
                                            d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                                            fill="currentFill"
                                          />
                                        </svg>
                                        <span className="sr-only">
                                          Loading...
                                        </span>
                                      </div>
                                      <p className="text-sm text-gray-500 whitespace-nowrap">
                                        Buscando informações
                                      </p>
                                    </div>
                                  </>
                                )}
                                {device?.initialConfig?.check && (
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
                                )}
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
