"use client";

import { IProfile } from "@/app/lib/definition";
import { ViewActualProfileForm } from "@/app/ui/forms/E3/view-actual-profile.form";

interface Props {
  searchParams: {
    id: string;
  };
}

type DeviceActualProfile = {
  profile: IProfile["config"];
  native_profile: { cxip?: string; dns?: string; check?: string };
};

export default function Page(props: Props) {
  const {
    searchParams: { id },
  } = props;

  let profileInLocalStorage: string | null = localStorage.getItem(
    `profile_${id}`
  );

  let profileParsed: null | DeviceActualProfile = null;
  if (profileInLocalStorage) {
    profileParsed = JSON.parse(profileInLocalStorage) as DeviceActualProfile;
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
      <div className="flex flex-wrap items-center gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
        {profileParsed ? (
          <ViewActualProfileForm config={profileParsed} />
        ) : (
          <p>Configuração não localizada</p>
        )}
      </div>
    </div>
  );
}
