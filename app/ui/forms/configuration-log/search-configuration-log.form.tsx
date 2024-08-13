"use client";

import {
  ArrowDownOnSquareIcon,
  ArrowPathIcon,
  FunnelIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Select } from "../../components/select";
import { IConfigurationLog, IProfile, IUser } from "@/app/lib/definition";
import { useSearchConfigurationLogForm } from "./use-search-configuration-log.form";
import { Dialog } from "../../components/dialog";
import { DateRange } from "../../components/date-range";

type Props = {
  data: (IConfigurationLog & { profile: IProfile; user: IUser })[];
  modal_is_open: boolean;
};

export function SearchConfigurationLogForm(props: Props) {
  const { data, modal_is_open } = props;

  const { handleQueryChange, handleExport, handleModalOpening, searchParams } =
    useSearchConfigurationLogForm();

  return (
    <>
      <div className="flex gap-2 w-full">
        <Input
          id="Nome"
          label=""
          placeholder="Busque por imei ou nome do usuário"
          onChange={(e) => handleQueryChange({ query: e.target.value })}
          containerClassname="max-w-sm"
          defaultValue={searchParams.get("query") ?? ""}
        />
        <Button
          variant="outlined"
          title="Filter"
          onClick={() => handleModalOpening(!modal_is_open)}
        >
          <FunnelIcon width={16} height={16} />
        </Button>
        <Button
          variant="outlined"
          title="Clear filters"
          onClick={() =>
            handleQueryChange({
              is_configured: undefined,
              query: undefined,
              from: undefined,
              to: undefined,
            })
          }
        >
          <ArrowPathIcon width={16} height={16} />
        </Button>
      </div>
      <Button
        variant="outlined"
        className="flex gap-2"
        onClick={() => handleExport(data)}
      >
        <ArrowDownOnSquareIcon height={16} width={16} /> Exportar
      </Button>
      {modal_is_open && (
        <Dialog
          open={modal_is_open}
          setOpen={() => handleModalOpening(!modal_is_open)}
        >
          <div className="h-fit flex flex-col gap-4">
            <div className="w-full flex justify-between items-center">
              <p className="block text-sm font-medium leading-6 text-gray-900">
                Modal para filtrar os logs de configuração
              </p>
              <Button
                variant="outlined"
                onClick={() => handleModalOpening(false)}
              >
                <XCircleIcon width={16} height={16} />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Select
                data={statusOptions}
                keyExtractor={(i) => i.id}
                valueExtractor={(i) => i.name}
                name="test_status"
                label="Status do teste"
                placeholder="Selecione um status"
                onChange={({ value }) =>
                  handleQueryChange({ is_configured: value })
                }
                value={statusOptions.find(
                  (el) => el.value === searchParams.get("is_configured")
                )}
              />
              <Input
                id="Nome"
                label="Serial, iccid, perfil ou usuário"
                placeholder="Busque pelo número serial, iccid, nome do perfil ou nome do usuário"
                onChange={(e) => handleQueryChange({ query: e.target.value })}
                containerClassname="w-full"
                defaultValue={searchParams.get("query") ?? ""}
              />
              <DateRange
                label="Selecione o periodo de tempo"
                onChange={(range) => {
                  handleQueryChange({
                    from: range.from.toISOString(),
                    to: range.to.toISOString(),
                  });
                }}
                range={{
                  from: searchParams.get("from")
                    ? new Date(searchParams.get("from")!)
                    : new Date(),
                  to: searchParams.get("to")
                    ? new Date(searchParams.get("to")!)
                    : new Date(),
                }}
              />
            </div>
            <div className="mt-6">
              <Button
                variant="primary"
                onClick={() => handleModalOpening(false)}
              >
                Aplicar Filtros
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </>
  );
}

const statusOptions = [
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
];
