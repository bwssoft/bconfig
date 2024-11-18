import { findAllUsers } from "@/app/lib/action";
import { PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import UserTable from "@/app/ui/tables/user/table";
import { auth } from "@/auth";

export default async function Example() {
  const users = await findAllUsers();
  const session = await auth();

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Gestão de Usuários
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Uma lista de todos os usuários registrados.
          </p>
        </div>

        <div className="ml-auto flex gap-6">
            {session?.user?.type === "employee" && (
                <Link
                    href="/profile/form/create/e3+4g"
                    className="flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
                    Novo Usuário
                </Link>
            )}
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <UserTable data={users} />
      </div>
    </div>
  );
}
