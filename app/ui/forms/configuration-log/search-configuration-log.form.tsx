"use client";

import {
  ArrowDownOnSquareIcon,
  ArrowPathIcon,
  FunnelIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { Select } from "../../components/select";
import { useSearchConfigurationLogForm } from "./use-search-configuration-log.form";
import { Dialog } from "../../components/dialog";
import { DateRange } from "../../components/date-range";
import { Controller } from "react-hook-form";

export function SearchConfigurationLogForm() {
  const {
    handleExport,
    register,
    handleSubmit,
    reset,
    control,
    modalIsOpen,
    handleOpenModal,
  } = useSearchConfigurationLogForm();

  return (
    <>
      <form className="flex gap-2 w-full" onSubmit={handleSubmit}>
        <Input
          id="Nome"
          label=""
          placeholder="Busque por imei ou nome do usuário"
          {...register("query")}
          containerClassname="max-w-sm"
        />
        <Button type="submit" variant="outlined" title="Search">
          <MagnifyingGlassIcon width={16} height={16} />
        </Button>
        <Button
          variant="outlined"
          title="Filter"
          type="button"
          onClick={() => handleOpenModal(true)}
        >
          <FunnelIcon width={16} height={16} />
        </Button>
        <Button
          variant="outlined"
          title="Clear filters"
          type="button"
          onClick={async () => {
            reset({
              is_configured: undefined,
              query: "",
              date: {
                from: undefined,
                to: undefined,
              },
              page: undefined,
            });
            await handleSubmit();
          }}
        >
          <ArrowPathIcon width={16} height={16} />
        </Button>
      </form>
      <form action={() => handleExport()}>
        <Button variant="outlined" className="flex gap-2" type="submit">
          <ArrowDownOnSquareIcon height={16} width={16} /> Exportar
        </Button>
      </form>
      {modalIsOpen && (
        <Dialog
          open={modalIsOpen}
          setOpen={() => handleOpenModal(!modalIsOpen)}
        >
          <form className="h-fit flex flex-col gap-4" onSubmit={handleSubmit}>
            <div className="w-full flex justify-between items-center">
              <p className="block text-sm font-medium leading-6 text-gray-900">
                Modal para filtrar os logs de configuração
              </p>
              <Button variant="outlined" onClick={() => handleOpenModal(false)}>
                <XCircleIcon width={16} height={16} />
              </Button>
            </div>
            <div className="flex flex-col gap-2">
              <Controller
                control={control}
                name="is_configured"
                render={({ field }) => (
                  <Select
                    data={statusOptions}
                    keyExtractor={(i) => i.id}
                    valueExtractor={(i) => i.name}
                    name="is_configured"
                    label="Status do teste"
                    placeholder="Selecione um status"
                    onChange={({ value }) => field.onChange(value)}
                    value={statusOptions.find((el) => el.value === field.value)}
                  />
                )}
              />
              <Input
                id="Nome"
                label="Serial, iccid, perfil ou usuário"
                placeholder="Busque pelo número serial, iccid, nome do perfil ou nome do usuário"
                {...register("query")}
                containerClassname="w-full"
              />
              <Controller
                control={control}
                name="date"
                render={({ field }) => (
                  <DateRange
                    label="Selecione o periodo de tempo"
                    onChange={(range) => {
                      field.onChange({
                        from: range.from.toISOString(),
                        to: range.to.toISOString(),
                      });
                    }}
                    range={{
                      from: field?.value?.from
                        ? new Date(field?.value?.from)
                        : new Date(),
                      to: field?.value?.to
                        ? new Date(field?.value?.to)
                        : new Date(),
                    }}
                  />
                )}
              />
            </div>
            <div className="mt-6">
              <Button type="submit" variant="primary">
                Aplicar Filtros
              </Button>
            </div>
          </form>
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
