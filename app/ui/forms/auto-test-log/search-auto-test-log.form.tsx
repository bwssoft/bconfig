"use client";

import { ArrowDownOnSquareIcon } from "@heroicons/react/24/outline";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Select } from "../../components/select";
import { IAutoTestLog, IUser } from "@/app/lib/definition";
import { useSearchAutoTestLogForm } from "./use-search-auto-test-log.form";

type Props = {
  data: (IAutoTestLog & { user: IUser })[];
};

export function SearchAutoTestLogForm(props: Props) {
  const { data } = props;

  const { handleInputChange, handleExport } = useSearchAutoTestLogForm();

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
        placeholder="Status do teste"
        onChange={({ value }) => handleInputChange({ is_successful: value })}
      />
      <Input
        id="Nome"
        label=""
        placeholder="Busque por imei, iccid, nome do usuário"
        onChange={(e) => handleInputChange({ query: e.target.value })}
      />
      <Button
        variant="outlined"
        className="flex gap-2"
        onClick={() => handleExport(data)}
      >
        <ArrowDownOnSquareIcon height={16} width={16} /> Exportar
      </Button>
    </>
  );
}
