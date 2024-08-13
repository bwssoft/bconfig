import { formatSearchParams } from "@/app/lib/util/format-search-params";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { jsonToXlsx } from "@/app/lib/util/json-to-xlsx";
import { IConfigurationLog, IProfile, IUser } from "@/app/lib/definition";

export function useSearchConfigurationLogForm() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleQueryChange = (input: {
    is_configured?: string;
    query?: string;
    from?: string;
    to?: string;
  }) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams(input, old_params);
    router.push(`${pathname}?${params}`);
  };

  const handleExport = (data: (IConfigurationLog & { user: IUser, profile: IProfile })[]) => {
    jsonToXlsx({
      data: data.map((c) => ({
        Configurado: c.is_configured ? "Sucesso" : "Falha",
        Usuario: c.user.name,
        Perfil: c.profile.name,
        Data: new Date(c.metadata.init_time_configuration).toLocaleString(),
        Imei: c.imei,
        Iccid: c.iccid,
        et: c.et,
        check: c.actual_native_profile?.check,
        cxip: c.actual_native_profile?.cxip,
        dns: c.actual_native_profile?.dns,
      })),
      fileName: new Date().toLocaleTimeString(),
      sheetName: "Dispositivos Configurados",
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
