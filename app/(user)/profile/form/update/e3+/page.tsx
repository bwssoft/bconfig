import { findOneProfile } from "@/app/lib/action";
import { E3ProfileUpdateForm } from "@/app/ui/forms/profile/update/e3/update-e3-profile.form";

interface Props {
  searchParams: { id: string };
}

export default async function ProfileUpdate(props: Props) {
  const {
    searchParams: { id },
  } = props;

  const profile = await findOneProfile({ id });

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Atualização de Perfil de configuração
          </h1>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Preencha o formulário abaixo para atualizar um perfil.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        {profile ? (
          <E3ProfileUpdateForm config={profile} />
        ) : (
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Esse perfil de atualização não foi encontrado.
          </h1>
        )}
      </div>
    </div>
  );
}
