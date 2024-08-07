"use client";

import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Select } from "../../components/select";
import { formatSearchParams } from "@/app/lib/util/format-search-params";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { IConfigurationLog, IProfile } from "@/app/lib/definition";
import { jsonToXlsx } from "@/app/lib/util/json-to-xlsx";

type Props = {
  data: (IConfigurationLog & { profile: IProfile })[];
};

export function SearchLogForm(props: Props) {
  const { data } = props;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const handleInputChange = (input: {
    is_configured?: string;
    query?: string;
  }) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams(input, old_params);
    router.push(`${pathname}?${params}`);
  };

  const handleExport = () => {
    jsonToXlsx({
      data: data.map((c) => ({
        Configurado: c.is_configured ? "Sucesso" : "Falha",
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
  return (
    <>
      <Select
        data={[
          {
            id: "null",
            name: "Nenhum",
            value: "null",
          },
          {
            id: "success",
            name: "Sucesso",
            value: "true",
          },
          {
            id: "error",
            name: "Falha",
            value: "false",
          },
        ]}
        keyExtractor={(i) => i.id}
        valueExtractor={(i) => i.name}
        name=""
        placeholder="Status da configuração"
        onChange={({ value }) => handleInputChange({ is_configured: value })}
      />
      <Input
        id="Nome"
        label=""
        placeholder="Busque por imei, iccid ou nome do perfil"
        onChange={(e) => handleInputChange({ query: e.target.value })}
      />
      <Button variant="outlined" className="flex gap-2" onClick={handleExport}>
        <ArrowDownOnSquareIcon height={16} width={16} /> Exportar
      </Button>
    </>
  );
}
