import { ISerialPort } from "@/app/lib/definition/serial";
import { cn } from "@/app/lib/util";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../components/button";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

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
  port: ISerialPort;
  imei?: string;
  iccid?: string;
  checked: boolean;
  not_configured: any;
  progress: number;
  step_label: string;
}>[] = [
  {
    header: "Configurado",
    accessorKey: "checked",
    cell: ({ row }) => {
      const device = row.original;
      const status =
        device.progress !== 100
          ? "progress"
          : device.checked
          ? "configured"
          : "error";
      return (
        <div className="flex items-center gap-1">
          <div className={cn(statuses[status], "flex-none rounded-full p-1")}>
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
          </div>
          <div className={cn("hidden font-semibold sm:block", text[status])}>
            {device.progress !== 100
              ? "Configurando"
              : device.checked
              ? "Configurado"
              : "Não Configurado"}
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
    header: "Progresso",
    accessorKey: "progress",
    cell: ({ row }) => {
      const { progress } = row.original;
      return <p>{progress}%</p>;
    },
  },
  {
    header: "Etapa",
    accessorKey: "label",
    cell: ({ row }) => {
      const { step_label } = row.original;
      return <p className="w-[200px]">{step_label}</p>;
    },
  },
  // {
  //   header: "Campos não configurados",
  //   accessorKey: "not_configured",
  //   cell: ({ row }) => {
  //     const device = row.original;
  //     const fields = Object.keys(
  //       device.not_configured
  //     ) as (keyof IProfile["config"])[];
  //     const displayedFields = fields.slice(0, 3);
  //     const remainingCount = fields.length - displayedFields.length;

  //     return (
  //       <div>
  //         {displayedFields.map((i) => configMapped[i]).join(", ")}
  //         {remainingCount > 0 && <span> +{remainingCount}</span>}
  //       </div>
  //     );
  //   },
  // },
  {
    header: "Ações",
    accessorKey: "port",
    cell: () => {
      return (
        <div className="flex gap-2">
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
        </div>
      );
    },
  },
];
