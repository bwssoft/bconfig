import { findAllConfigurationLog } from "@/app/lib/action/configuration-log.action";
import { SearchConfigurationLogForm } from "@/app/ui/forms/configuration-log/search-configuration-log.form";
import ConfigurationLogTable from "@/app/ui/tables/configuration-log/table";

export default async function Example(props: {
  searchParams: {
    query?: string;
    is_configured?: string;
    modal_is_open?: string;
    from?: string;
    to?: string;
  };
}) {
  const {
    searchParams: { query, is_configured, modal_is_open, from, to },
  } = props;

  const handleQueryParams = () => {
    return {
      is_configured:
        is_configured === "false"
          ? false
          : is_configured === "true"
          ? true
          : undefined,
      query: query ?? "",
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };
  };

  const configurationLogs = await findAllConfigurationLog(handleQueryParams());

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Logs de configuração
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Uma lista de todos os logs de configuração registrados na sua conta.
          </p>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <SearchConfigurationLogForm
          data={configurationLogs}
          modal_is_open={modal_is_open === "true" ? true : false}
        />
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <ConfigurationLogTable data={configurationLogs} />
      </div>
    </div>
  );
}
