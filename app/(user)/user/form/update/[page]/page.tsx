import { findOneUserById } from "@/app/lib/action";
import { UserUpdateForm } from "@/app/ui/forms/user/update/update-user.form";



export default async function Page({
  params,
}: {
  params: Promise<{ page: string }>
}) {
  const id = (await params).page
  

  const user = await findOneUserById({ id });

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Atualizar Usuário</h1>
      <UserUpdateForm initialData={user} />
    </div>
  );

}