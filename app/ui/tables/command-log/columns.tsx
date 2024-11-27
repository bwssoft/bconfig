import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<{
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
];
