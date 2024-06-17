"use client";
import { ISerialPort } from "@/app/lib/definitions/serial";
import { cn } from "@/app/util/cn";
import { CheckIcon, XMarkIcon } from "@heroicons/react/20/solid";
import Alert from "../../components/alert";
import { Button } from "../../components/button";

const icons = {
  open: { icon: CheckIcon, bgColorClass: "bg-green-500" },
  close: { icon: XMarkIcon, bgColorClass: "bg-gray-400" },
};
export default function PortsFeed(props: {
  ports: {
    port: ISerialPort;
    open: boolean;
    reader?: ReadableStreamDefaultReader<Uint8Array> | undefined;
    info?: { usbProductId?: number; usbVendorId?: number };
    imei?: string;
    iccid?: string;
    et?: string;
  }[];
  openPort: (port: ISerialPort) => Promise<void>;
  closePort: (port: ISerialPort) => Promise<void>;
  requestPort: () => Promise<void>;
  forgetPort: (port: ISerialPort) => Promise<void>;
}) {
  const { ports, openPort, closePort, requestPort, forgetPort } = props;

  const handleOpenPort = async (port: ISerialPort) => {
    if (port.writable && port.readable) {
      await closePort(port);
      return;
    }
    await openPort(port);
  };

  const handleForgetPort = async (port: ISerialPort) => {
    await forgetPort(port);
  };

  const handleOpenAllPorts = async () => {
    for (let p of ports) {
      await handleOpenPort(p.port);
    }
  };

  return (
    <>
      <div className="mt-6 flow-root">
        {ports.length > 0 ? (
          <ul role="list" className="-mb-8">
            {ports.map((item, itemIdx) => {
              const { info, port, open, imei } = item;
              const isOpen = open;
              const random = Math.random();
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
                          <a href="#" className="font-medium text-gray-900">
                            {imei ?? info?.usbVendorId}
                          </a>
                        </p>
                        <div className="flex whitespace-nowrap text-right text-sm text-gray-500 gap-2">
                          <form
                            id="handle-open-port"
                            action={() => handleOpenPort(port)}
                          >
                            <Button type="submit" variant="outlined">
                              {isOpen ? "Fechar" : "Abrir"}
                            </Button>
                          </form>

                          {!isOpen && (
                            <form
                              id="handle-forget-port"
                              action={() => handleForgetPort(port)}
                            >
                              <Button type="submit" variant="outlined">
                                Esquecer
                              </Button>
                            </form>
                          )}
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
        <form id="request-new-port" action={requestPort} className="w-full">
          <Button type="submit" variant="primary" className="w-full">
            Requisitar nova porta
          </Button>
        </form>
        <form
          id="open-all-ports"
          action={handleOpenAllPorts}
          className="w-full"
        >
          <Button type="submit" variant="outlined" className="w-full">
            Abrir todas as portas
          </Button>
        </form>
        <form
          id="close-all-ports"
          action={handleOpenAllPorts}
          className="w-full"
        >
          <Button type="submit" variant="outlined" className="w-full">
            Fechar todas as portas
          </Button>
        </form>
      </div>
    </>
  );
}
