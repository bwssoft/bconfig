import { toast } from "@/app/hook/use-toast";
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
      const model = profile.model;
      return (
        <td className="flex gap-2 relative whitespace-nowrap pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
          <Link
            href={`/profile/form/update/${model.toLowerCase()}?id=${
              profile.id
            }`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Editar
          </Link>
          <form
            action={() => {
              try {
                deleteOneProfileById({ id: profile.id });
                toast({
                  title: "Sucesso!",
                  description: "Perfil deletado com sucesso!",
                  variant: "success",
                });
              } catch (e) {
                toast({
                  title: "Falha!",
                  description: "Falha ao deletar o perfil!",
                  variant: "error",
                });
              }
            }}
          >
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
