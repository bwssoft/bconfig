import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<{
  name: string;
  model: string;
}>[] = [
  { header: "Nome", accessorKey: "name" },
  {
    header: "Modelo",
    accessorKey: "model",
  },
];
