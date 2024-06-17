import { ISerialPort } from "@/app/lib/definitions/serial";
import { QuestionMarkCircleIcon } from "@heroicons/react/20/solid";
import { Select } from "../../components/select";
import { Button } from "../../components/button";
import { useEffect, useState } from "react";

const user = {
  name: "Whitney Francis",
  email: "whitney@example.com",
  imageUrl:
    "https://images.unsplash.com/photo-1517365830460-955ce3ccd263?ixlib=rb-=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=8&w=256&h=256&q=80",
};

const comments = [
  {
    id: 1,
    name: "Leslie Alexander",
    date: "4d ago",
    imageId: "1494790108377-be9c29b29330",
    body: "Ducimus quas delectus ad maxime totam doloribus reiciendis ex. Tempore dolorem maiores. Similique voluptatibus tempore non ut.",
  },
  {
    id: 2,
    name: "Michael Foster",
    date: "4d ago",
    imageId: "1519244703995-f4e0f30006d5",
    body: "Et ut autem. Voluptatem eum dolores sint necessitatibus quos. Quis eum qui dolorem accusantium voluptas voluptatem ipsum. Quo facere iusto quia accusamus veniam id explicabo et aut.",
  },
  {
    id: 3,
    name: "Dries Vincent",
    date: "4d ago",
    imageId: "1506794778202-cad84cf45f1d",
    body: "Expedita consequatur sit ea voluptas quo ipsam recusandae. Ab sint et voluptatem repudiandae voluptatem et eveniet. Nihil quas consequatur autem. Perferendis rerum et.",
  },
];

const additionalFunctions = [
  {
    name: "Atualização da posição em curva",
    id: 1,
  },
  {
    name: "Indicar LED",
    id: 2,
  },
  {
    name: "Modo de Economia",
    id: 3,
  },

  {
    name: "Alerta de falha de GPRS (SMS)",
    id: 4,
  },
  {
    name: "Alerta de ignição / Corte de alimentação (SMS)",
    id: 5,
  },
  {
    name: "Ignição Virtual",
    id: 6,
  },
  {
    name: "Modo de Trabalho",
    id: 7,
  },
  {
    name: "Posição de LBS",
    id: 8,
  },
];

type Port = {
  port: ISerialPort;
  open: boolean;
  reader?: ReadableStreamDefaultReader<Uint8Array>;
  imei?: string;
  iccid?: string;
  et?: string;
};

const extractModel = (et?: string): Model | null => {
  if (!et) return null;
  // const match = et.match(/(BWSiot_E3\+\w*4GW|BWSiot_E3\+\w*)/);
  const match = et.match(/_(E3\+4GW|E3\+)_/);
  console.log("match", match ? match[1] : null);
  return match ? (match[1] as Model) : null;
};
const handleIdentifierDeviceModel = (ports: Port[]): Model | null => {
  const modelCount = ports.reduce((acc: Record<string, number>, port: Port) => {
    const model = extractModel(port?.et);
    if (model) {
      acc[model] = (acc[model] || 0) + 1;
    }
    return acc;
  }, {});

  let predominantModel: string | null = null;
  let maxCount: number = 0;
  let maxCountModels: number = 0;

  for (const [model, count] of Object.entries(modelCount)) {
    if (count > maxCount) {
      predominantModel = model;
      maxCount = count;
      maxCountModels = 1;
    } else if (count === maxCount) {
      maxCountModels += 1;
    }
  }

  return maxCountModels > 1 ? null : (predominantModel as Model);
};

type Model = "E3+" | "E3+Personal" | "E3+LongLife" | "E3+4GW";

export function Config(props: {
  ports: Port[];
  writeToPort: (port: ISerialPort, data: string) => void;
  readFromPort: (
    port: ISerialPort,
    callback: (decoded: string, port: ISerialPort) => void
  ) => void;
}) {
  const { ports, writeToPort } = props;
  const [currentPort, setCurrentPort] = useState<Port>();
  const [model, setModel] = useState<Model | null>();
  const isMultiple = ports.length > 0 && ports.length !== 1 ? true : false;

  useEffect(() => {
    const model = handleIdentifierDeviceModel(ports);
    setModel(model);
  }, [ports]);

  return (
    <div className="flex flex-col gap-6">
      {/* Description list*/}
      <section aria-labelledby="communication">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2
              id="applicant-information-title"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Requisitar Configurações
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Essa ação irá preencher o formulário automaticamente com as
              informações do equipamento.
            </p>
          </div>

          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="pb-5">
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Configurações de um rastreador
              </p>
            </div>
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              {isMultiple && (
                <div className="sm:col-span-1">
                  <Select
                    data={ports}
                    keyExtractor={(p) =>
                      p.port.getInfo().usbProductId as number
                    }
                    valueExtractor={(p) => {
                      const usbProductId = p.port.getInfo().usbProductId;
                      if (p.imei) {
                        return `${usbProductId} - ${p.imei}`;
                      }
                      return usbProductId as number;
                    }}
                    onChange={(value) => setCurrentPort(value)}
                  />
                </div>
              )}
              <div className="sm:col-span-1">
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  onClick={() => {
                    if (isMultiple) {
                      currentPort?.port &&
                        writeToPort(currentPort?.port, "CHECK");
                      return;
                    }
                    ports[0]?.port && writeToPort(ports[0]?.port, "CHECK");
                  }}
                >
                  Requisitar Configuração
                </button>
              </div>
            </dl>
          </div>
          <div className="px-4 sm:px-6">
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Modelo a ser configurado
            </p>
          </div>
          <div className="px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <div className="mt-6 flex flex-col-reverse justify-stretch space-y-4 space-y-reverse sm:flex-row-reverse sm:space-x-3 sm:space-y-0 sm:space-x-reverse md:mt-0 md:flex-row md:space-x-3">
                  <Button
                    type="button"
                    variant={model === "E3+" ? "primary" : "outlined"}
                  >
                    E3+
                  </Button>
                  <Button
                    type="button"
                    variant={model === "E3+Personal" ? "primary" : "outlined"}
                  >
                    E3+ Personal
                  </Button>
                  <Button
                    type="button"
                    variant={model === "E3+LongLife" ? "primary" : "outlined"}
                  >
                    E3+ Long Life
                  </Button>
                  <Button
                    type="button"
                    variant={model === "E3+4GW" ? "primary" : "outlined"}
                  >
                    E3+ 4G
                  </Button>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

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
                <dt className="text-sm font-medium text-gray-500">APN</dt>
                <dd className="mt-1 text-sm text-gray-900">bws.com.br</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Intervalo de Transmissão (Segundos)
                </dt>
                <div className="flex gap-2">
                  <dd className="mt-1 text-sm text-gray-900">Ligado: 60</dd>
                  <dd className="mt-1 text-sm text-gray-900">Desligado: 60</dd>
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
                <dd className="mt-1 text-sm text-gray-900">Progressivo</dd>
              </div>
              <div className="sm:col-span-1">
                <dt className="text-sm font-medium text-gray-500">
                  Fuso Horário
                </dt>
                <dd className="mt-1 text-sm text-gray-900">UTC+00:00</dd>
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
                <dt className="text-sm font-medium text-gray-500">Tempo TX</dt>
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
                <div key={id} className="relative flex items-start py-4">
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

      {/* Comments*/}
      <section aria-labelledby="notes-title">
        <div className="bg-white shadow sm:overflow-hidden sm:rounded-lg">
          <div className="divide-y divide-gray-200">
            <div className="px-4 py-5 sm:px-6">
              <h2
                id="notes-title"
                className="text-lg font-medium text-gray-900"
              >
                Notes
              </h2>
            </div>
            <div className="px-4 py-6 sm:px-6">
              <ul role="list" className="space-y-8">
                {comments.map((comment) => (
                  <li key={comment.id}>
                    <div className="flex space-x-3">
                      <div className="flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-full"
                          src={`https://images.unsplash.com/photo-${comment.imageId}?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80`}
                          alt=""
                        />
                      </div>
                      <div>
                        <div className="text-sm">
                          <a href="#" className="font-medium text-gray-900">
                            {comment.name}
                          </a>
                        </div>
                        <div className="mt-1 text-sm text-gray-700">
                          <p>{comment.body}</p>
                        </div>
                        <div className="mt-2 space-x-2 text-sm">
                          <span className="font-medium text-gray-500">
                            {comment.date}
                          </span>{" "}
                          <span className="font-medium text-gray-500">
                            &middot;
                          </span>{" "}
                          <button
                            type="button"
                            className="font-medium text-gray-900"
                          >
                            Reply
                          </button>
                        </div>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-6 sm:px-6">
            <div className="flex space-x-3">
              <div className="flex-shrink-0">
                <img
                  className="h-10 w-10 rounded-full"
                  src={user.imageUrl}
                  alt=""
                />
              </div>
              <div className="min-w-0 flex-1">
                <form action="#">
                  <div>
                    <label htmlFor="comment" className="sr-only">
                      About
                    </label>
                    <textarea
                      id="comment"
                      name="comment"
                      rows={3}
                      className="block w-full rounded-md border-0 py-1.5 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6"
                      placeholder="Add a note"
                      defaultValue={""}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <a
                      href="#"
                      className="group inline-flex items-start space-x-2 text-sm text-gray-500 hover:text-gray-900"
                    >
                      <QuestionMarkCircleIcon
                        className="h-5 w-5 flex-shrink-0 text-gray-400 group-hover:text-gray-500"
                        aria-hidden="true"
                      />
                      <span>Some HTML is okay.</span>
                    </a>
                    <button
                      type="submit"
                      className="inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                    >
                      Comment
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
