import { findOneConfigurationLog } from "@/app/lib/action/configuration-log.action";
import { ViewConfigurationForm } from "@/app/ui/forms/E3-view/view-configuration.form";
import { E34GViewConfigurationForm } from "@/app/ui/forms/E34G-view/view-configuration.form";

interface Props {
  searchParams: {
    id: string;
  };
}

export default async function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;

  const configuration = await findOneConfigurationLog({ id });

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
