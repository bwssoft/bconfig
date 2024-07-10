import { deleteOneProfileById } from "@/app/lib/action";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const columns: ColumnDef<{
  id: string;
  name: string;
  model: string;
}>[] = [
  { header: "Nome", accessorKey: "name" },
  {
    header: "Modelo",
    accessorKey: "model",
  },
  {
    header: "Ações",
    accessorKey: "name",
    cell: ({ row }) => {
      const profile = row.original;
      return (
        <td className="flex gap-2 relative whitespace-nowrap pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
          <Link
            href={`/profile/form/update?id=${profile.id}`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Editar
          </Link>
          <form action={() => deleteOneProfileById({ id: profile.id })}>
            <button
              type="submit"
              className="text-indigo-600 hover:text-indigo-900 px-0 py-0"
            >
              Deletar
            </button>
          </form>
        </td>
      );
    },
  },
];
