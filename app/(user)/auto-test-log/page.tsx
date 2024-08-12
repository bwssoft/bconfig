import { findAllAutoTestLog } from "@/app/lib/action/auto-test-log.action";
import AutoTestLogTable from "@/app/ui/tables/auto-test-log/table";

export default async function Example() {
  const autoTestLog = await findAllAutoTestLog();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Logs do auto test
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Uma lista de todos os logs do auto test registrados na sua conta.
          </p>
        </div>
      </div>
      {/* <div className="mt-5 flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <SearchLogForm data={autoTestLog} />
      </div> */}
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <AutoTestLogTable data={autoTestLog} />
      </div>
    </div>
  );
}
