"use client";

import { Configuration } from "@/app/hook/use-E3-communication";
import { E34GViewConfigurationForm } from "@/app/ui/forms/E34G/view-configuration.form";

interface Props {
  searchParams: {
    id: string;
  };
}

export default function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;

  let configurationInLocalstorage = localStorage.getItem(
    `configuration_result_${id}`
  );
  let configuration: null | Configuration = null;
  if (configurationInLocalstorage) {
    configuration = JSON.parse(configurationInLocalstorage) as Configuration;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Revisar configuração
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Possivel observar e ter insights sobre os logs de um equipamento
            configurado.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        {configuration ? (
          <E34GViewConfigurationForm config={configuration} />
        ) : (
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Essa configuração não foi encontrada.
          </h1>
        )}
      </div>
    </div>
  );
}
