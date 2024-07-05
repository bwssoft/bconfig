import { ISerialPort } from "@/app/lib/definition/serial";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<{
  port: ISerialPort;
  answer?: string;
  command: string;
}>[] = [
  { header: "Comando", accessorKey: "command" },
  {
    header: "Resposta",
    accessorKey: "answer",
    cell: ({ row }) => {
      const device = row.original;
      return <p>{device.answer ?? "--"}</p>;
    },
  },
];
