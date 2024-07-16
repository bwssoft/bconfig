import {
  economyMode,
  functions,
  lockType,
  timezones,
  workMode,
} from "@/app/constants/e3+config";
import { IProfile } from "@/app/lib/definition";

interface Props {
  config: {
    profile: IProfile["config"];
    native_profile: { cxip?: string; dns?: string; check?: string };
  };
}
export function ViewActualProfileForm(props: Props) {
  const {
    config: { profile, native_profile },
  } = props;
  return (
    <form autoComplete="off" className="flex flex-col gap-6 mt-6">
      <section aria-labelledby="communication">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Comunicação
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Detalhes de como o equipamento se comunica
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-400">APN</dt>
                <div className="flex gap-8 mt-2">
                  <div className="px-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Endereço
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {profile?.apn?.address ?? "--"}
                    </dd>
                  </div>
                  <div className="px-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Usuário
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {profile?.apn?.user ?? "--"}
                    </dd>
                  </div>
                  <div className="px-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Senha
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {profile?.apn?.password ?? "--"}
                    </dd>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-full">
                <dt className="text-sm font-medium text-gray-400">
                  Configurações de Rede
                </dt>
                <div className="flex gap-8 mt-2">
                  <div className="px-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      IP Primário
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {profile?.ip?.primary?.ip
                        ? profile?.ip?.primary?.ip +
                          ":" +
                          profile?.ip?.primary?.port
                        : "--"}
                    </dd>
                  </div>
                  <div className="px-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      IP Secundário
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {profile?.ip?.secondary?.ip
                        ? profile?.ip?.secondary?.ip +
                          ":" +
                          profile?.ip?.secondary?.port
                        : "--"}
                    </dd>
                  </div>
                  <div className="px-4 sm:px-0">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Dns
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {profile?.dns
                        ? profile?.dns?.address + ":" + profile?.dns?.port
                        : "--"}
                    </dd>
                  </div>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="general-config">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Configurações Gerais
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Detalhes do equipamento e suas configurações.
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-full">
                <dt className="text-sm font-medium text-gray-400">
                  Intervalo de Transmissão
                </dt>
                <div className="grid grid-cols-2 gap-x-4 gap-y-8 mt-2 flex-1">
                  <div className="px-4 sm:px-0 sm:grid-cols-1">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Monitorado Ligado (Segundos)
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {profile?.data_transmission?.on ?? "--"}
                    </dd>
                  </div>
                  <div className="px-4 sm:px-0 sm:grid-cols-1">
                    <dt className="text-sm font-medium leading-6 text-gray-900">
                      Monitorado Desligado (Segundos)
                    </dt>
                    <dd className="mt-1 text-sm leading-6 text-gray-700">
                      {profile?.data_transmission?.off ?? "--"}
                    </dd>
                  </div>
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Sensibilidade do acelerômetro
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {profile?.accelerometer_sensitivity ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Tipo do bloqueio
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {lockType.find((el) => el.value === profile?.lock_type)
                      ?.label ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Fuso horário
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {timezones.find((el) => el.value === profile?.timezone)
                      ?.label ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Modo de econommia
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {economyMode.find(
                      (el) => el.value === profile?.economy_mode
                    )?.label ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Ajuste de sensibilidade
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {profile?.sensitivity_adjustment ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Tempo Keep Alive (Segundos)
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {profile?.keep_alive ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Hodômetro
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {profile?.odometer ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-1">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Modo de trabalho
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {workMode.find((el) => el.value === profile.work_mode)
                      ?.label ?? "--"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="additional-functions">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Funções
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Detalhes do equipamento e suas configurações.
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
            <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {functions.map((func, id) => (
                <div key={id} className="relative flex items-center py-4">
                  <div className="min-w-0 flex-1 text-sm leading-6">
                    <label
                      htmlFor={`functions-${func.name}`}
                      className="select-none font-medium text-gray-900"
                    >
                      {func.label}
                    </label>
                  </div>
                  <div className="ml-3 flex h-6 items-center gap-2">
                    <input
                      type="checkbox"
                      checked={
                        profile[func.name as keyof typeof profile] as boolean
                      }
                      readOnly={true}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section aria-labelledby="native-config">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Dados Brutos
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Resposta de cada um dos comandos enviados para obter a
              configuração atual do equipamento.
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Check
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {native_profile.check ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Cxip
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {native_profile.cxip ?? "--"}
                  </dd>
                </div>
              </div>
              <div className="sm:col-span-full">
                <div className="px-4 sm:px-0">
                  <dt className="text-sm font-medium leading-6 text-gray-900">
                    Dns
                  </dt>
                  <dd className="mt-1 text-sm leading-6 text-gray-700">
                    {native_profile.dns ?? "--"}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </form>
  );
}
