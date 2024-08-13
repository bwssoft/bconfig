import { findOneAutoTestLog } from "@/app/lib/action/auto-test-log.action";
import { E34GViewAutoTestForm } from "@/app/ui/forms/E34G/view-auto-test-log.form";

interface Props {
  searchParams: {
    id: string;
  };
}

export default async function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;

  const auto_test = await findOneAutoTestLog({ id });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Visualizar logs do auto test
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Possivel observar e ter insights sobre os logs de um equipamento
            configurado.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        {auto_test ? (
          <E34GViewAutoTestForm auto_test={auto_test} />
        ) : (
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Essa configuração não foi encontrada.
          </h1>
        )}
      </div>
    </div>
  );
}
