import { findAllAutoTestLog } from "@/app/lib/action/auto-test-log.action";
import { SearchAutoTestLogForm } from "@/app/ui/forms/auto-test-log/search-auto-test-log.form";
import AutoTestLogTable from "@/app/ui/tables/auto-test-log/table";

export default async function Example(props: {
  searchParams: {
    query?: string;
    is_successful?: string;
    modal_is_open?: string;
    from?: string;
    to?: string;
  };
}) {
  const {
    searchParams: { query, is_successful, modal_is_open, from, to },
  } = props;

  const handleQueryParams = () => {
    return {
      is_successful:
        is_successful === "false"
          ? false
          : is_successful === "true"
          ? true
          : undefined,
      query: query ?? "",
      from: from ? new Date(from) : undefined,
      to: to ? new Date(to) : undefined,
    };
  };

  const autoTestLog = await findAllAutoTestLog(handleQueryParams());

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
      <div className="mt-5 flex justify-between items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <SearchAutoTestLogForm
          data={autoTestLog}
          modal_is_open={modal_is_open === "true" ? true : false}
        />
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <AutoTestLogTable data={autoTestLog} />
      </div>
    </div>
  );
}
