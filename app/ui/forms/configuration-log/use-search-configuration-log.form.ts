import { formatSearchParams } from "@/app/lib/util/format-search-params";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { jsonToXlsx } from "@/app/lib/util/json-to-xlsx";
import { IConfigurationLog, IProfile, IUser } from "@/app/lib/definition";
import { exportConfigurationLog } from "@/app/lib/action";
import * as XLSX from 'xlsx'

export function useSearchConfigurationLogForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleQueryChange = (input: {
    is_configured?: string;
    query?: string;
    from?: string;
    to?: string;
    page?: string;
  }) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams(input, old_params);
    router.push(`${pathname}?${params}`);
  };

  const parseSearchParams = (searchParams: URLSearchParams) => {
    const params: {
      is_configured?: boolean;
      query?: string;
      from?: Date;
      to?: Date;
    } = {};

    searchParams.forEach((value, key) => {
      if (value) {
        if (key === "to" || key === "from") {
          params[key] = new Date(value);
        }
        if (key === "is_configured") {
          params[key] = value === "true" ? true : false
        }
        if (key === 'query') {
          params[key] = value
        }
      }
    });

    return {
      is_configured: params.is_configured,
      query: params.query,
      from: params.from,
      to: params.to,
    };
  }

  const handleExport = async () => {
    const workbook = await exportConfigurationLog(parseSearchParams(searchParams))
    XLSX.writeFile(workbook, `${new Date().toLocaleDateString()}-LOG-CONFIG.xlsx`);
  };

  const handleModalOpening = (open: boolean) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams({ modal_is_open: open }, old_params);
    router.push(`${pathname}?${params}`);
  };

  return {
    searchParams,
    pathname,
    router,
    handleQueryChange,
    handleExport,
    handleModalOpening,
  };
}
