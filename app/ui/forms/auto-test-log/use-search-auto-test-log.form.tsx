import { formatSearchParams } from "@/app/lib/util/format-search-params";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { jsonToXlsx } from "@/app/lib/util/json-to-xlsx";
import { IAutoTestLog, IUser } from "@/app/lib/definition";

export function useSearchAutoTestLogForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleInputChange = (input: {
    is_successful?: string;
    query?: string;
  }) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams(input, old_params);
    router.push(`${pathname}?${params}`);
  };

  const handleExport = (data: (IAutoTestLog & { user: IUser })[]) => {
    jsonToXlsx({
      data: data.map((c) => ({
        Sucesso: c.is_successful ? "Sucesso" : "Falha",
        Usuarui: c.user.name,
        Inicio: new Date(c.metadata.init_time_configuration).toLocaleString(),
        Fim: new Date(c.metadata.end_time_configuration).toLocaleString(),
        "Tempo Total": `${
          (c.metadata.end_time_configuration -
            c.metadata.init_time_configuration) /
          1000
        }S`,
        Imei: c.imei,
        Iccid: c.iccid,
        et: c.et,
        "Comandos Enviados": c.metadata.commands_sent
          .map((c) => c.response)
          .join("|"),
      })),
      fileName: new Date().toLocaleTimeString(),
      sheetName: "Dispositivos Testados",
    });
  };

  return {
    searchParams,
    pathname,
    router,
    handleInputChange,
    handleExport,
  };
}
