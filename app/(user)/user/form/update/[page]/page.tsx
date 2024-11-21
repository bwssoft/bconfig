import { findOneUserById } from "@/app/lib/action";
import { UserUpdateForm } from "@/app/ui/forms/user/update/update-user.form";

export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>;
}) {
  const id = (await params).page;

  const user = await findOneUserById({ id });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Atualização de Usuário
          </h1>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Preencha o formulário abaixo para atualizar um usuário.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        {user ? (
          <UserUpdateForm initialData={user} />
        ) : (
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Esse usuário de atualização não foi encontrado.
          </h1>
        )}
      </div>
    </div>
  );
}
