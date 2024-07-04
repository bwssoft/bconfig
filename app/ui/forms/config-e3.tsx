import {
  accelerometerSensitivity,
  economyMode,
  functions,
  lockType,
  timezones,
} from "@/app/constants/e3+config";
import { Input } from "../components/input";
import { Select } from "../components/select";
import { Radio } from "../components/radio";
import { useConfigE3Form } from "./use-config-e3.form";
import { Controller } from "react-hook-form";

interface Props {
  config: any;
}
export function ConfigE3Form(props: Props) {
  const { config } = props;
  const { register, ipdns, handleChangeIpDns, handleSubmit, control } =
    useConfigE3Form({
      defaultValues: config,
    });
  return (
    <form
      autoComplete="off"
      className="flex flex-col gap-6"
      onSubmit={handleSubmit}
    >
      <section aria-labelledby="communication">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2
              id="applicant-information-title"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Comunicação
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detalhes do equipamento e suas configurações.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-3">
              <div className="sm:col-span-2">
                <dt className="text-sm font-medium text-gray-400">
                  Senha do Dispositivo
                </dt>
                <div className="flex gap-2 mt-2">
                  <Input
                    {...register("password.old")}
                    id="old_password"
                    label="Antiga"
                    placeholder="000000"
                  />
                  <Input
                    {...register("password.new")}
                    id="new_password"
                    label="Nova"
                    placeholder="123456"
                  />
                </div>
              </div>
              <div className="sm:col-span-full">
                <dt className="text-sm font-medium text-gray-400">Apn</dt>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="addres"
                    label="Endereço"
                    placeholder="www.bws.com"
                    {...register("apn.address")}
                  />
                  <Input
                    id="apn_user"
                    label="Usuário"
                    placeholder="usuario"
                    {...register("apn.user")}
                  />
                  <Input
                    id="apn_password"
                    label="Senha"
                    placeholder="123456"
                    {...register("apn.password")}
                  />
                </div>
              </div>
              <div className="sm:col-span-full">
                <dt className="text-sm font-medium text-gray-400">
                  Configurações de Rede
                </dt>
                <div className="mt-2">
                  <Radio
                    data={[{ value: "IP" }, { value: "DNS" }]}
                    keyExtractor={(d) => d.value}
                    valueExtractor={(d) => d.value}
                    name="ip_dns"
                    label="Ip ou DNS"
                    onChange={({ value }) =>
                      handleChangeIpDns(value as "IP" | "DNS")
                    }
                    defaultValue={{ value: "IP" }}
                  />
                </div>
              </div>
              {ipdns === "IP" && (
                <div className="sm:col-span-full">
                  <div className="flex gap-2">
                    <div className="flex gap-2">
                      <Input
                        id="primary_ip"
                        label="Ip"
                        placeholder="124.451.451.12"
                        {...register("ip.primary.ip")}
                      />
                      <Input
                        id="primary_ip_port"
                        label="Porta"
                        placeholder="2000"
                        type="number"
                        {...register("ip.primary.port")}
                      />
                    </div>
                    <div className="flex gap-2">
                      <Input
                        id="secondary_ip"
                        label="Ip"
                        placeholder="124.451.451.12"
                        {...register("ip.secondary.ip")}
                      />
                      <Input
                        id="secondary_ip_port"
                        label="Porta"
                        placeholder="2000"
                        type="number"
                        {...register("ip.secondary.port")}
                      />
                    </div>
                  </div>
                </div>
              )}
              {ipdns === "DNS" && (
                <div className="sm:col-span-full">
                  <div className="flex gap-2">
                    <Input
                      id="dns_address"
                      label="Endereço"
                      placeholder="dns.btrace.easytrack"
                      {...register("dns.address")}
                    />
                    <Input
                      id="dns_port"
                      label="Porta"
                      placeholder="2000"
                      type="number"
                      {...register("dns.port")}
                    />
                  </div>
                </div>
              )}
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="general-config">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2
              id="applicant-information-title"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Configurações Gerais
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detalhes do equipamento e suas configurações.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-full">
                <dt className="text-sm font-medium text-gray-400">
                  Intervalo de Transmissão
                </dt>
                <div className="flex gap-2 mt-2">
                  <Input
                    {...register("data_transmission.on")}
                    id="transmission_on"
                    label="Monitorado Ligado"
                    placeholder="60"
                    type="number"
                  />
                  <Input
                    {...register("data_transmission.off")}
                    id="transmission_off"
                    label="Monitorado Desligado"
                    placeholder="180"
                    type="number"
                  />
                </div>
              </div>
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="accelerometer_sensitivity"
                  render={({ field }) => (
                    <Select
                      name="accelerometer_sensitivity"
                      data={accelerometerSensitivity}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Sensibilidade do acelerômetro"
                      value={accelerometerSensitivity.find(
                        (d) => d.value === field.value
                      )}
                      onChange={(d) => field.onChange(d.value)}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="lock_type"
                  render={({ field }) => (
                    <Select
                      name="lock_type"
                      data={lockType}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Tipo de bloqueio"
                      value={lockType.find((d) => d.value === field.value)}
                      onChange={(d) => field.onChange(d.value)}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="timezone"
                  render={({ field }) => (
                    <Select
                      name="timezone"
                      data={timezones}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Fuso Horário"
                      value={timezones.find((tz) => tz.value === field.value)}
                      onChange={(d) => field.onChange(d.value)}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="economy_mode"
                  render={({ field }) => (
                    <Select
                      name="economy_mode"
                      data={economyMode}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Modo de Economia"
                      value={economyMode.find((d) => d.value === field.value)}
                      onChange={(d) => field.onChange(d.value)}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  {...register("sensitivity_adjustment")}
                  id="sensibility"
                  label="Ajuste de Sensibilidade"
                  placeholder="500"
                  type="number"
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  {...register("keep_alive")}
                  id="keep_alive"
                  label="Tempo Keep Alive"
                  placeholder="60"
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  {...register("odometer")}
                  id="hodometer"
                  label="Hodômetro"
                  placeholder="5000"
                  type="number"
                />
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section aria-labelledby="additional-functions">
        <div className="bg-white shadow sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6">
            <h2
              id="applicant-information-title"
              className="text-lg font-medium leading-6 text-gray-900"
            >
              Funções
            </h2>
            <p className="mt-1 max-w-2xl text-sm text-gray-500">
              Detalhes do equipamento e suas configurações.
            </p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
            <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {functions.map((prop, id) => (
                <div key={id} className="relative flex items-start py-4">
                  <div className="min-w-0 flex-1 text-sm leading-6">
                    <label
                      htmlFor={`functions-${prop.id}`}
                      className="select-none font-medium text-gray-900"
                    >
                      {prop.name}
                    </label>
                  </div>
                  <div className="ml-3 flex h-6 items-center">
                    <input
                      id={`functions-${prop.id}`}
                      name={`functions-${prop.id}`}
                      type="checkbox"
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <button type="submit">submit</button>
    </form>
  );
}
