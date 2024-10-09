import { E34GProfileCreateForm } from "@/app/ui/forms/profile/create/e34g/create-e34g-profile.form";

export default function E34GProfileCreate() {
  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Registro de Perfil para o E3+4G
          </h1>
          <p className="mt-1 text-sm leading-6 text-gray-600">
            Preencha o formulário abaixo para registrar um perfil.
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        <E34GProfileCreateForm />
      </div>
    </div>
  );
}
