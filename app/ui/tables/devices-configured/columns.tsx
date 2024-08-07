import { ISerialPort } from "@/app/lib/definition/serial";
import { cn } from "@/app/lib/util";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../components/button";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";
import { IProfile } from "@/app/lib/definition";
import { configMapped } from "@/app/constants/e3+config";
import Link from "next/link";

const statuses = {
  progress: "text-gray-500 bg-gray-800/20",
  configured: "text-green-500 bg-green-800/20",
  error: "text-rose-500 bg-rose-800/20",
};

const text = {
  progress: "text-gray-800",
  configured: "text-green-800",
  error: "text-rose-800",
};

export const columns: ColumnDef<{
  id: string;
  port: ISerialPort;
  imei?: string;
  iccid?: string;
  is_configured: boolean;
  not_configured: any;
  profile_name: string;
}>[] = [
  {
    header: "Configurado",
    accessorKey: "checked",
    cell: ({ row }) => {
      const device = row.original;
      const status = device.is_configured ? "configured" : "error";
      const label = device.is_configured ? "Configurado" : "Não Configurado";
      return (
        <div className="flex items-center gap-1">
          <div className={cn(statuses[status], "flex-none rounded-full p-1")}>
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
          </div>
          <div className={cn("hidden font-semibold sm:block", text[status])}>
            {label}
          </div>
        </div>
      );
    },
  },
  {
    header: "Imei",
    accessorKey: "imei",
    cell: ({ row }) => {
      const device = row.original;
      return device.imei ?? "--";
    },
  },
  {
    header: "Iccid",
    accessorKey: "iccid",
    cell: ({ row }) => {
      const device = row.original;
      return <p title={device.iccid}>{device.iccid ? device.iccid : "--"}</p>;
    },
  },
  {
    header: "Nome do perfil",
    accessorKey: "profile_name",
    cell: ({ row }) => {
      const device = row.original;
      return device.profile_name ?? "--";
    },
  },
  // {
  //   header: "Progresso",
  //   accessorKey: "progress",
  //   cell: ({ row }) => {
  //     const { progress } = row.original;
  //     return <p>{progress}%</p>;
  //   },
  // },
  // {
  //   header: "Etapa",
  //   accessorKey: "label",
  //   cell: ({ row }) => {
  //     const { step_label } = row.original;
  //     return <p className="w-[200px]">{step_label}</p>;
  //   },
  // },
  {
    header: "Campos não configurados",
    accessorKey: "not_configured",
    cell: ({ row }) => {
      const device = row.original;
      const fields = Object.keys(
        device.not_configured
      ) as (keyof IProfile["config"])[];
      const displayedFields = fields.slice(0, 2);
      const remainingCount = fields.length - displayedFields.length;

      return fields.length ? (
        <div>
          {displayedFields.map((i) => configMapped[i]).join(", ")}
          {remainingCount > 0 && <span> +{remainingCount}</span>}
        </div>
      ) : (
        <p>Nenhum</p>
      );
    },
  },
  {
    header: "Ações",
    accessorKey: "port",
    cell: ({ row }) => {
      const configuration = row.original;
      return (
        <div className="flex gap-2">
          <Link
            href={`/configurator/E3+/review?id=${configuration.id}`}
            target="_blank"
          >
            <Button
              variant="outlined"
              className="p-2"
              title="Verificar logs de configuração"
            >
              <DocumentMagnifyingGlassIcon
                width={16}
                height={16}
                title="Verificar logs de configuração"
              />
            </Button>
          </Link>
        </div>
      );
    },
  },
];
