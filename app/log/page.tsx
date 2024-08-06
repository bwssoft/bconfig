import DeviceConfiguredTable from "../ui/tables/devices-configured/table";
import { findAllConfigurationLog } from "../lib/action/configuration-log.action";

export default async function Example() {
  const configurationLogs = await findAllConfigurationLog();
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
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <DeviceConfiguredTable data={configurationLogs} />
      </div>
    </div>
  );
}
