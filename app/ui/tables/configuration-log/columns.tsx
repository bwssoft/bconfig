import { ISerialPort } from "@/app/lib/definition/serial";
import { cn } from "@/app/lib/util";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../components/button";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

const statuses = {
  configured: "text-green-500 bg-green-800/20",
  error: "text-rose-500 bg-rose-800/20",
};

const text = {
  configured: "text-green-800",
  error: "text-rose-800",
};

export const columns: ColumnDef<{
  port: ISerialPort;
  imei?: string;
  iccid?: string;
  checked: boolean;
  not_configured: any;
}>[] = [
  {
    header: "Configurado",
    accessorKey: "checked",
    cell: ({ row }) => {
      const device = row.original;
      const status = device.checked ? "configured" : "error";
      return (
        <div className="flex items-center gap-1">
          <div className={cn(statuses[status], "flex-none rounded-full p-1")}>
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
          </div>
          <div className={cn("hidden font-semibold sm:block", text[status])}>
            {device.checked ? "Configurado" : "Não Configurado"}
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
