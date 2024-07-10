"use client";

interface Props {
  searchParams: {
    id: string;
  };
}

export default function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;

  let profile = localStorage.getItem(`profile_${id}`);
  if (profile) {
    profile = JSON.parse(profile);
  }

  return (
    <div>
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8 ">
        <div>
          <h1 className="text-base font-semibold leading-7 text-gray-900">
            Visualizar configuração atual
          </h1>
          <p className="mt-2 text-sm text-gray-700">
            Possivel observar e ter insights sobre a configuração atual de um
            equipamento.
          </p>
        </div>
      </div>
      <pre>{JSON.stringify(profile, null, 2)}</pre>
    </div>
  );
}
