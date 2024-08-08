import DeviceConfiguredTable from "@/app/ui/tables/devices-configured/table";
import { findAllConfigurationLog } from "@/app/lib/action/configuration-log.action";
import { SearchLogForm } from "@/app/ui/forms/log/search-log.form";

export default async function Example(props: {
  searchParams: { query?: string; is_configured?: string };
}) {
  const {
    searchParams: { query, is_configured },
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
        <SearchLogForm data={configurationLogs} />
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <DeviceConfiguredTable data={configurationLogs} />
      </div>
    </div>
  );
}
