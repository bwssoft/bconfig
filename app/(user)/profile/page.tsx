import { findAllProfile } from "@/app/lib/action";
import { PlusIcon } from "@heroicons/react/20/solid";
import Link from "next/link";
import ProfileTable from "@/app/ui/tables/profile/table";

export default async function Example() {
  const profiles = await findAllProfile();
  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Gestão de Perfis
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Uma lista de todos os perfis registrados na sua conta.
          </p>
        </div>

        <div className="ml-auto flex gap-6">
          <Link
            href="/profile/form/create"
            className="flex items-center gap-x-1 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon className="-ml-1.5 h-5 w-5" aria-hidden="true" />
            Novo Perfil
          </Link>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 space-y-12">
        <ProfileTable data={profiles} />
      </div>
    </div>
  );
}
