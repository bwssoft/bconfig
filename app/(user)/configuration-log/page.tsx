import { findAllConfigurationLog } from "@/app/lib/action/configuration-log.action";
import { Pagination } from "@/app/ui/components/pagination";
import { SearchConfigurationLogForm } from "@/app/ui/forms/configuration-log/search-configuration-log.form";
import ConfigurationLogTable from "@/app/ui/tables/configuration-log/table";

export default async function Example(props: {
  searchParams: {
    query?: string;
    is_configured?: string;
    from?: string;
    to?: string;
    page?: string;
  };
}) {
  const {
    searchParams: { query, is_configured, from, to, page },
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
      page: page ? Number(page) : undefined,
    };
  };

  const { data: configurationLogs, total } = await findAllConfigurationLog(
    handleQueryParams()
  );

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
        <SearchConfigurationLogForm />
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <ConfigurationLogTable data={configurationLogs} />
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <Pagination total={Math.round(total / 20)} />
      </div>
    </div>
  );
}
