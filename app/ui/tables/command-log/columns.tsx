import { ISerialPort } from "@/app/lib/definition/serial";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<{
  init_time_command: number;
  end_time_command?: number;
  request: string;
  response?: string;
}>[] = [
  { header: "Comando", accessorKey: "request" },
  {
    header: "Resposta",
    accessorKey: "response",
    cell: ({ row }) => {
      const device = row.original;
      return device.response ?? "--";
    },
  },
  {
    header: "Data de envio",
    accessorKey: "date",
    cell: ({ row }) => {
      const device = row.original;
      return new Date(device.init_time_command).toLocaleString();
    },
  },
  {
    header: "Data de resposta",
    accessorKey: "date",
    cell: ({ row }) => {
      const device = row.original;
      return device.end_time_command
        ? new Date(device.end_time_command).toLocaleString()
        : "--";
    },
  },
];
