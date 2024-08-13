import { formatSearchParams } from "@/app/lib/util/format-search-params";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { jsonToXlsx } from "@/app/lib/util/json-to-xlsx";
import { IAutoTestLog, IUser } from "@/app/lib/definition";

export function useSearchAutoTestLogForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleQueryChange = (input: {
    is_successful?: string;
    query?: string;
    from?: string;
    to?: string;
  }) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams(input, old_params);
    router.push(`${pathname}?${params}`);
  };

  const handleExport = (data: (IAutoTestLog & { user: IUser })[]) => {
    jsonToXlsx({
      data: data.map((c) => ({
        Status: c.is_successful ? "Success" : "Failed",
        User: c.user.name,
        "Init Time": new Date(
          c.metadata.init_time_configuration
        ).toLocaleString(),
        "End Time": new Date(
          c.metadata.end_time_configuration
        ).toLocaleString(),
        "Duration Time": `${
          (c.metadata.end_time_configuration -
            c.metadata.init_time_configuration) /
          1000
        }S`,
        Imei: c.imei,
        Iccid: c.iccid,
        Firmware: c.et,
        "Commands sent": c.metadata.commands_sent
          .map((c) => c.response)
          .join("|"),
      })),
      fileName: new Date().toLocaleTimeString(),
      sheetName: "Dispositivos Testados",
    });
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
