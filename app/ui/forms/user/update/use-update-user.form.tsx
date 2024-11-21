"use client";

import { toast } from "@/app/hook/use-toast";
import { updateOneUserById } from "@/app/lib/action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

// Tipos permitidos de usuário
const userTypes = ["employee", "external", "client"] as const;

const schema = z
  .object({
    name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
    email: z.string().email({ message: "Email inválido." }),
    type: z.enum(userTypes),
    password: z.string().optional(),
    confirm_password: z.string().optional(),
  })
  .refine((data) => !data.password || data.password === data.confirm_password, {
    message: "As senhas devem coincidir.",
    path: ["confirm_password"],
  });

export type UpdateSchema = z.infer<typeof schema>;

export function useUserUpdateForm(initialData: UpdateSchema & { id: string }) {
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    reset: hookFormReset,
  } = useForm<UpdateSchema>({
    resolver: zodResolver(schema),
    defaultValues: {
      ...initialData,
      password: undefined,
      confirm_password: undefined,
    },
  });

  const userType = userTypes.map((type) => ({ value: type }));

  const handleSubmit = hookFormSubmit(
    async (data) => {
      const { id } = initialData;
      const { name, email, type, password } = data;
  
      const updateData: Partial<UpdateSchema> = {
        name,
        email,
        type,
      };
  
      if (password) {
        updateData.password = password;
      }
  
      try {
        await updateOneUserById({ id }, updateData);
        toast({
          title: "Sucesso!",
          description: "Usuário atualizado com sucesso!",
          variant: "success",
        });
      } catch (e) {
        console.error(e);
        toast({
          title: "Erro!",
          description: "Não foi possível atualizar o usuário.",
          variant: "error",
        });
      }
    },
    () => {
      toast({
        title: "Erro de Validação",
        description: "Corrija os erros no formulário.",
        variant: "error",
      });
    }
  );
  

  return {
    register,
    handleSubmit,
    errors,
    control,
    reset: hookFormReset,
    userType,
  };
}
