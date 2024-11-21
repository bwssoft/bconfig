"use client";

import { useUserUpdateForm } from "./use-update-user.form";
import { Input } from "@/app/ui/components/input";
import { Button } from "@/app/ui/components/button";
import { Controller } from "react-hook-form";
import { Select } from "@/app/ui/components/select";

interface UserUpdateFormProps {
  initialData: {
    name: string;
    email: string;
    type: "employee" | "external" | "client";
    id: string;
  };
}

export const UserUpdateForm: React.FC<UserUpdateFormProps> = ({ initialData }) => {
  const { register, handleSubmit, errors, reset, control, userType } = useUserUpdateForm(initialData);

  return (
    <form
      autoComplete="off"
      className="flex flex-col gap-6 mt-6 w-full"
      onSubmit={handleSubmit}
    >
      <div className="bg-white sm:rounded-lg w-full">
        <div className="py-5 sm:w-[25%] w-full">
          <Controller
            control={control}
            name="type"
            render={({ field }) => (
              <Select
                name="type"
                data={userType}
                keyExtractor={(d) => d.value}
                valueExtractor={(d) => d.value}
                label="Tipo de usuário"
                value={userType.find((d) => d.value === field.value)}
                onChange={(d) => field.onChange(d.value)}
              />
            )}
          />
        </div>
        <div className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-6 w-full">
          <div className="sm:col-span-3">
            <Input
              {...register("name")}
              id="name"
              label="Nome"
              placeholder="Digite o nome do usuário"
              error={errors?.name?.message}
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              {...register("email")}
              id="email"
              label="Email"
              placeholder="Digite o email do usuário"
              error={errors?.email?.message}
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              {...register("password")}
              id="password"
              type="password"
              label="Nova senha"
              placeholder="Digite a nova senha do usuário"
              error={errors?.password?.message}
            />
          </div>
          <div className="sm:col-span-3">
            <Input
              {...register("confirm_password")}
              id="confirm_password"
              type="password"
              label="Confirme a nova senha"
              placeholder="Confirme a nova senha do usuário"
              error={errors?.confirm_password?.message}
            />
          </div>
        </div>
      </div>

      <div className="mt-6 flex items-center justify-end gap-x-6">
        <button
          type="button"
          onClick={() => {
            reset({
              ...initialData,
              password: "",
              confirm_password: "", 
            });
          }}
          className="text-sm font-semibold leading-6 text-gray-900"
        >
          Resetar
        </button>
        <Button variant="primary" type="submit">
          Atualizar
        </Button>
      </div>
    </form>
  );
};
