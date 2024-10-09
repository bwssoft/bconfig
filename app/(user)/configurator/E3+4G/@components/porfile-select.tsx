"use client";

import { IProfile } from "@/app/lib/definition";
import { Select } from "@/app/ui/components/select";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  profiles: IProfile[];
  currentProfileIdSelected: string;
}
export function ProfileSelect(props: Props) {
  const { profiles, currentProfileIdSelected } = props;
  const { replace } = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const handleChange = (id?: string) => {
    const params = new URLSearchParams(searchParams);
    if (id) {
      params.set("id", id);
    } else {
      params.delete("id");
    }
    replace(`${pathname}?${params.toString()}`);
  };
  return (
    <div className="mt-10 flex flex-col gap-6 px-4 sm:flex-nowrap sm:px-6 lg:px-8">
      <div>
        <h1 className="text-base font-semibold leading-7 text-gray-900">
          Etapa 1: Selecione um perfil
        </h1>
        <p className="mt-2 text-sm text-gray-700">
          Para Configurar algum equipamento é necessário a seleção do perfil
        </p>
      </div>
      <Select
        data={[
          {
            id: "null",
            name: "Nenhum",
            model: "E3+" as IProfile["model"],
            config: {} as IProfile["config"],
            created_at: new Date(),
          },
        ].concat(profiles)}
        keyExtractor={(i) => i.id}
        valueExtractor={(i) => i.name}
        onChange={(i) => handleChange(i.id)}
        value={profiles.filter((p) => p.id === currentProfileIdSelected)?.[0]}
        name="Perfil"
        placeholder="Selecione um perfil para configuração"
      />
    </div>
  );
}
