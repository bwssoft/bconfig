import { toast } from "@/app/hook/use-toast";
import { deleteOneUserById } from "@/app/lib/action";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";

export const columns: ColumnDef<{
  id: string;
  name: string;
  email: string;
}>[] = [
  { header: "Nome", accessorKey: "name" },
  {
    header: "Email",
    accessorKey: "email",
  },
  {
    header: "Ações",
    accessorKey: "name",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <td className="flex gap-2 relative whitespace-nowrap pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
          <Link
            href={`/user/form/update/${user.name.toLowerCase()}?id=${
                user.id
            }`}
            className="text-indigo-600 hover:text-indigo-900"
          >
            Editar
          </Link>
          <form
            action={() => {
              try {
                deleteOneUserById({ id: user.id });
                toast({
                  title: "Sucesso!",
                  description: "Usuário deletado com sucesso!",
                  variant: "success",
                });
              } catch (e) {
                toast({
                  title: "Falha!",
                  description: "Falha ao deletar o usuário!",
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
