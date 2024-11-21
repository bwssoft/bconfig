import { toast } from "@/app/hook/use-toast";
import { createOneUser } from "@/app/lib/action";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
    name: z 
      .string()
      .min(3, { message: "O nome deve ter pelo menos 3 caracteres." }),
    email: z
      .string()
      .email({ message: "Email inválido." }),
    type: z.enum(["employee", "external", "client"]),
    password: z
      .string()
      .min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
    confirm_password: z
      .string()
      .min(6, { message: "A senha deve ter pelo menos 6 caracteres." }),
}).refine((data) => data.password === data.confirm_password, {
  message: "As senhas devem coincidir.",
  path: ["confirm_password"],
})

export type Schema = z.infer<typeof schema>;


export function useUserCreateForm() {
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    setValue,
    reset: hookFormReset
  } = useForm<Schema>({
    resolver: zodResolver(schema),
  });

  const userType = [{value:"employee"},{value: "external"}, {value: "client"}];

  const handleSubmit = hookFormSubmit(
    async (data) => {
      try {
        const { name, email, password } = data;
        await createOneUser({
            name,
            email,
            password,
            type: data.type,  
            connected: false
        });
        toast({
          title: "Sucesso!",
          description: "Usuário registrado com sucesso!",
          variant: "success",
        })
      } catch (e) {
        console.error(e)
        toast({
          title: "Falha!",
          description: "Falha ao registrar o usuário!",
          variant: "error",
        })
      }
    },
    () => {
      toast({
        title: "Erro de Validação",
        description: "Por favor, corrija os erros no formulário antes de submeter.",
        variant: "error",
      });
    });

  return {
    register,
    handleSubmit,
    errors,
    control,
    setValue,
    reset: hookFormReset,
    userType
  };
}
