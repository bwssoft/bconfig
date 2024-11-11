"use client";

import {
  communicationType,
  protocolType,
  economyMode,
  functions,
  lockType as lockTypeConstant,
  optional_functions,
  timezones,
  input1,
  input2,
} from "@/app/constants/e3+4gconfig";
import { Input } from "../../../../components/input";
import { Select } from "../../../../components/select";
import { Radio } from "../../../../components/radio";
import { useE34GProfileCreateForm } from "./use-create-e34g-profile.form";
import { Controller } from "react-hook-form";
import Toggle from "../../../../components/toggle";
import { Button } from "../../../../components/button";
import Alert from "../../../../components/alert";

export function E34GProfileCreateForm() {
  const {
    register,
    ipdns,
    handleChangeIpDns,
    handleSubmit,
    control,
    errors,
    reset,
    lockType,
    watch,
  } = useE34GProfileCreateForm();
  return (
    <form
      autoComplete="off"
      className="flex flex-col gap-6 mt-6"
      onSubmit={handleSubmit}
    >
      <section aria-labelledby="general">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Perfil de configuração
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Insira o nome do perfil.
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-1">
                <Input
                  {...register("name")}
                  id="Nome"
                  label="Nome"
                  placeholder="Perfil#00"
                  error={errors?.name?.message}
                />
              </div>
            </dl>
          </div>
        </div>
      </section>
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
              Detalhes do equipamento e suas configurações.
            </p>
          </div>
          <div className="border-t border-gray-200 py-5">
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
                    error={errors?.password?.old?.message}
                  />
                  <Input
                    {...register("password.new")}
                    id="new_password"
                    label="Nova"
                    placeholder="123456"
                    error={errors?.password?.new?.message}
                  />
                </div>
              </div>
              <div className="sm:col-span-full">
                <dt className="text-sm font-medium text-gray-400">APN</dt>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="addres"
                    label="Endereço"
                    placeholder="bws.br"
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
                    label="IP ou DNS"
                    onChange={({ value }) =>
                      handleChangeIpDns(value as "IP" | "DNS")
                    }
                    defaultValue={{ value: ipdns }}
                  />
                </div>
              </div>
              {ipdns === "IP" && (
                <div className="sm:col-span-full">
                  <div className="flex gap-2">
                    <div className="relative">
                      <div className="flex gap-2">
                        <Input
                          id="primary_ip"
                          label="IP"
                          placeholder="124.451.451.12"
                          {...register("ip.primary.ip")}
                          error={errors?.ip?.primary?.ip?.message}
                        />
                        <Input
                          id="primary_ip_port"
                          label="Porta"
                          placeholder="2000"
                          type="number"
                          {...register("ip.primary.port")}
                          error={errors?.ip?.primary?.port?.message}
                        />
                      </div>
                      <p className="mt-2 text-sm text-red-600 absolute">
                        {errors?.ip?.primary?.root?.message}
                      </p>
                    </div>
                    <div className="relative">
                      <div className="flex gap-2">
                        <Input
                          id="secondary_ip"
                          label="IP"
                          placeholder="124.451.451.12"
                          {...register("ip.secondary.ip")}
                          error={errors?.ip?.secondary?.ip?.message}
                        />
                        <Input
                          id="secondary_ip_port"
                          label="Porta"
                          placeholder="2000"
                          type="number"
                          {...register("ip.secondary.port")}
                          error={errors?.ip?.secondary?.port?.message}
                        />
                      </div>
                      <p className="mt-2 text-sm text-red-600 absolute">
                        {errors?.ip?.secondary?.root?.message}
                      </p>
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
                      error={errors?.dns?.port?.message}
                    />
                  </div>
                </div>
              )}
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
                <div className="flex gap-2 mt-2">
                  <Input
                    {...register("data_transmission.on")}
                    id="transmission_on"
                    label="Monitorado Ligado (Segundos)"
                    placeholder="60"
                    type="number"
                    error={errors.data_transmission?.on?.message}
                  />
                  <Input
                    {...register("data_transmission.off")}
                    id="transmission_off"
                    label="Monitorado Desligado (Segundos)"
                    placeholder="180"
                    type="number"
                    error={errors.data_transmission?.off?.message}
                  />
                </div>
              </div>
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="lock_type"
                  render={({ field }) => (
                    <Select
                      name="lock_type"
                      data={lockTypeConstant}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Tipo do bloqueio"
                      value={lockTypeConstant.find(
                        (d) => d.value === field.value
                      )}
                      onChange={(d) => field.onChange(d.value)}
                    />
                  )}
                />
              </div>
              {lockType === 1 ? (
                <div className="sm:col-span-full">
                  <dt className="text-sm font-medium text-gray-400">
                    Definir Progressão (ms)
                  </dt>
                  <div className="flex gap-2 mt-2">
                    <Input
                      {...register("lock_type_progression.n1")}
                      id="lock_type_progression_n1"
                      label="N1"
                      placeholder="60"
                      type="number"
                      error={errors.lock_type_progression?.n1?.message}
                    />
                    <Input
                      {...register("lock_type_progression.n2")}
                      id="lock_type_progression_n2"
                      label="n2"
                      placeholder="180"
                      type="number"
                      error={errors.lock_type_progression?.n2?.message}
                    />
                  </div>
                </div>
              ) : (
                <></>
              )}
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
                  {...register("keep_alive")}
                  id="keep_alive"
                  label="Tempo Keep Alive (Segundos)"
                  placeholder="60"
                  error={errors.keep_alive?.message}
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  {...register("odometer")}
                  id="odometer"
                  label="Hodômetro"
                  placeholder="5000"
                  type="number"
                  error={errors.odometer?.message}
                />
              </div>
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="input_1"
                  render={({ field }) => (
                    <Select
                      name="input_1"
                      data={input1}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Entrada 1"
                      value={input1.find((d) => d.value === field.value)}
                      onChange={(d) => field.onChange(d.value)}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="input_2"
                  render={({ field }) => (
                    <Select
                      name="input_2"
                      data={input2}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Entrada 2"
                      value={input2.find((d) => d.value === field.value)}
                      onChange={(d) => field.onChange(d.value)}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  {...register("max_speed")}
                  id="max_speed"
                  label="Velocidade Máxima"
                  placeholder="150"
                  type="number"
                  error={errors.max_speed?.message}
                />
              </div>
              <div className="sm:col-span-1">
                <Controller
                  control={control}
                  name="communication_type"
                  render={({ field }) => (
                    <Select
                      name="communication_type"
                      data={communicationType}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Tipo de comunicação"
                      value={communicationType.find(
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
                  name="protocol_type"
                  render={({ field }) => (
                    <Select
                      name="protocol_type"
                      data={protocolType}
                      keyExtractor={(d) => d.value}
                      valueExtractor={(d) => d.label}
                      label="Tipo do protocolo"
                      value={protocolType.find((d) => d.value === field.value)}
                      onChange={(d) => field.onChange(d.value)}
                    />
                  )}
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  {...register("horimeter")}
                  id="horimeter"
                  label="Horímetro (ms)"
                  placeholder="3600"
                  type="number"
                  step="0.01"
                  error={errors.horimeter?.message}
                />
              </div>
              <div className="sm:col-span-1">
                <Input
                  {...register("ack")}
                  id="ack"
                  label="Definir ack"
                  placeholder="30"
                  type="number"
                  error={errors.ack?.message}
                />
              </div>
            </dl>
          </div>
        </div>
      </section>
      <section aria-labelledby="functions">
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
          <Alert
            title="Essas funções SEMPRE gerarão um comando no momento de configurar."
            variant="ghost"
          />
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
                    <Controller
                      control={control}
                      name={func.name as any}
                      render={({ field }) => (
                        <Toggle onChange={field.onChange} value={field.value} />
                      )}
                    />
                  </div>
                </div>
              ))}

              <div>
                <div className="relative flex items-center py-4">
                  <div className="min-w-0 flex-1 text-sm leading-6">
                    <label
                      htmlFor={"functions-cornering_position_update"}
                      className="select-none font-medium text-gray-900"
                    >
                      Atualização da posição em curva
                    </label>
                  </div>
                  <div className="ml-3 flex h-6 items-center gap-2">
                    <Controller
                      control={control}
                      name={"cornering_position_update"}
                      render={({ field }) => (
                        <Toggle onChange={field.onChange} value={field.value} />
                      )}
                    />
                  </div>
                </div>
                {watch("cornering_position_update") ? (
                  <div className="sm:col-span-1">
                    <Input
                      {...register("angle_adjustment")}
                      id="angle_adjustment"
                      label="Ajuste de ângulo"
                      placeholder="45"
                      type="number"
                      error={errors.angle_adjustment?.message}
                    />
                  </div>
                ) : (
                  <></>
                )}
              </div>

              <div>
                <div className="relative flex items-center py-4">
                  <div className="min-w-0 flex-1 text-sm leading-6">
                    <label
                      htmlFor={"functions-virtual_ignition"}
                      className="select-none font-medium text-gray-900"
                    >
                      Ignição Virtual
                    </label>
                  </div>
                  <div className="ml-3 flex h-6 items-center gap-2">
                    <Controller
                      control={control}
                      name={"virtual_ignition"}
                      render={({ field }) => (
                        <Toggle onChange={field.onChange} value={field.value} />
                      )}
                    />
                  </div>
                </div>
              </div>

              {watch("virtual_ignition") ? (
                <>
                  <div>
                    <div className="pl-4 relative flex items-center py-4">
                      <div className="min-w-0 flex-1 text-sm leading-6">
                        <label
                          htmlFor={"functions-virtual_ignition"}
                          className="select-none font-medium text-gray-900"
                        >
                          Ignição por Tensão
                        </label>
                      </div>
                      <div className="ml-3 flex h-6 items-center gap-2">
                        <Controller
                          control={control}
                          name={"virtual_ignition_by_voltage"}
                          render={({ field }) => (
                            <Toggle
                              onChange={field.onChange}
                              value={field.value}
                            />
                          )}
                        />
                      </div>
                    </div>
                    {watch("virtual_ignition_by_voltage") ? (
                      <div className="pl-4 sm:col-span-full">
                        <dt className="text-sm font-medium text-gray-400">
                          Definir Ignição por voltagem (voltagem)
                        </dt>
                        <div className="flex gap-2 mt-2">
                          <Input
                            {...register("ignition_by_voltage.t1")}
                            id="ignition_by_voltage_t1"
                            label="VION (t1)"
                            placeholder="60"
                            type="number"
                            step="0.01"
                            error={errors.ignition_by_voltage?.t1?.message}
                          />
                          <Input
                            {...register("ignition_by_voltage.t2")}
                            id="ignition_by_voltage_t2"
                            label="VIOFF (t2)"
                            placeholder="180"
                            type="number"
                            step="0.01"
                            error={errors.ignition_by_voltage?.t2?.message}
                          />
                        </div>
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>

                  <div>
                    <div className="pl-4 relative flex items-center py-4">
                      <div className="min-w-0 flex-1 text-sm leading-6">
                        <label
                          htmlFor={"functions-virtual_ignition_by_movement"}
                          className="select-none font-medium text-gray-900"
                        >
                          Ignição por Movimento
                        </label>
                      </div>
                      <div className="ml-3 flex h-6 items-center gap-2">
                        <Controller
                          control={control}
                          name={"virtual_ignition_by_movement"}
                          render={({ field }) => (
                            <Toggle
                              onChange={field.onChange}
                              value={field.value}
                            />
                          )}
                        />
                      </div>
                    </div>
                    {watch("virtual_ignition_by_movement") ? (
                      <div className="pl-4 sm:col-span-1">
                        <Input
                          {...register("sensitivity_adjustment")}
                          id="sensibility"
                          label="Ajuste de Sensibilidade"
                          placeholder="500"
                          type="number"
                          error={errors.sensitivity_adjustment?.message}
                        />
                      </div>
                    ) : (
                      <></>
                    )}
                  </div>
                </>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </section>
      <section aria-labelledby="functions-optional">
        <div className="bg-white sm:rounded-lg">
          <div className="py-5">
            <h1
              id="applicant-information-title"
              className="text-base font-semibold leading-7 text-gray-900"
            >
              Funções Opcionais
            </h1>
            <p className="mt-2 text-sm text-gray-700">
              Detalhes do equipamento e suas configurações.
            </p>
          </div>
          <Alert
            title="Essas funções APENAS gerarão comandos no momento de configurar se forem habilitadas."
            variant="ghost"
          />
          <div className="border-t border-gray-200 py-5">
            <div className="divide-y divide-gray-200 border-b border-t border-gray-200">
              {optional_functions.map((func, id) => (
                <div key={id} className="relative flex items-center py-4">
                  <div className="flex">
                    <div className="flex h-6 items-center">
                      <input
                        id={func.name}
                        {...register(`optional_functions.${func.name}`)}
                        type="checkbox"
                        aria-describedby="id-description"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-600"
                      />
                    </div>
                    <div className="ml-3 text-sm leading-6">
                      <label
                        htmlFor={func.name}
                        className="font-medium text-gray-600"
                      >
                        Ativar comando
                      </label>
                    </div>
                  </div>
                  <div className="ml-3 min-w-0 flex-1 text-sm leading-6">
                    <label
                      htmlFor={`functions-${func.name}`}
                      className="select-none font-medium text-gray-900"
                    >
                      {func.label}
                    </label>
                  </div>
                  <div className="ml-3 flex h-6 items-center gap-2">
                    <Controller
                      control={control}
                      name={func.name as any}
                      render={({ field }) => (
                        <Toggle onChange={field.onChange} value={field.value} />
                      )}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => reset()}
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Limpar
        </button>
        <Button variant="primary" type="submit">
          Registrar
        </Button>
      </div>
    </form>
  );
}
