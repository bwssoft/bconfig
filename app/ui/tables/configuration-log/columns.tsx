import { ISerialPort } from "@/app/lib/definition/serial";
import { cn } from "@/app/lib/util";
import { ColumnDef } from "@tanstack/react-table";

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
            {device.checked ? "Configurado" : "Error"}
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
      return device.iccid ?? "--";
    },
  },
  {
    header: "Campos não configurados",
    accessorKey: "not_configured",
    cell: ({ row }) => {
      const device = row.original;
      return Object.keys(device.not_configured).join(", ");
    },
  },
];
