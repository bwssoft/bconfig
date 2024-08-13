import { toast } from "@/app/hook/use-toast";
import { createOneProfile } from "@/app/lib/action";
import { IProfile } from "@/app/lib/definition";
import { removeEmptyValues, removeUndefined } from "@/app/lib/util";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const password = z
  .string()
  .max(6, { message: "A senha deve ter no máximo 6 caracteres." })
  .optional()

const data_transmission = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .max(65535, { message: "O valor deve ser no máximo 65535" })
  .optional()

const ip = z
  .string()
  .ip({ message: "IP inválido." })
  .optional()

const port = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .optional()

const sensitivity_adjustment = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .min(30, { message: "O valor deve ser no mínimo 30" })
  .max(1000, { message: "O valor deve ser no máximo 1000" })
  .optional()

const keep_alive = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .min(60, { message: "O valor deve ser no mínimo 60" })
  .max(1800, { message: "O valor deve ser no máximo 1800" })
  .optional()

const odometer = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .optional()

const schema = z.preprocess(removeEmptyValues, z
  .object({
    name: z.string({ message: "O nome é orbigatório" }),
    model: z.enum(["E3+", "E3+4G"], { message: "O modelo deve ser E3+ ou E3+4G" }),
    password: z.object({ old: password, new: password }).optional(),
    apn: z
      .object({
        address: z.string().optional(),
        user: z.string().optional(),
        password: z.string().optional(),
      })
      .optional(),
    ip: z
      .object({
        primary: z.object({
          ip: ip,
          port: port,
        }).optional(),
        secondary: z.object({
          ip: ip,
          port: port,
        }).optional(),
      })
      .optional(),
    dns: z
      .object({
        address: z.string().optional(),
        port: port,
      })
      .optional(),
    timezone: z.coerce.number().optional(),
    lock_type: z.coerce.number().optional(),
    data_transmission: z
      .object({
        on: data_transmission,
        off: data_transmission,
      })
      .optional(),
    odometer: odometer,
    keep_alive: keep_alive,
    accelerometer_sensitivity: z.coerce.number().optional(),
    economy_mode: z.coerce.number().optional(),
    sensitivity_adjustment: sensitivity_adjustment,
    lbs_position: z.coerce.boolean().optional().default(false),
    cornering_position_update: z.coerce.boolean().optional().default(false),
    ignition_alert_power_cut: z.coerce.boolean().optional().default(false),
    gprs_failure_alert: z.coerce.boolean().optional().default(false),
    led: z.coerce.boolean().optional().default(false),
    virtual_ignition: z.coerce.boolean().optional().default(false),
    work_mode: z.string().optional(),
    // panic_button: z.coerce.boolean().optional().default(false),
    // module_violation: z.coerce.boolean().optional().default(false),
  })).transform(removeUndefined)

export type Schema = z.infer<typeof schema>;

export function useProfileCreateForm() {
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

  const [ipdns, setIpdns] = useState<"IP" | "DNS">("IP");
  const handleChangeIpDns = (value: "IP" | "DNS") => {
    setIpdns(value);
  };

  const handleSubmit = hookFormSubmit(
    async (data) => {
      try {
        const { name, model, ...config } = data;
        await createOneProfile({
          name,
          config,
          model: model as IProfile["model"]
        });
        toast({
          title: "Sucesso!",
          description: "Perfil registrado com sucesso!",
          variant: "success",
        })
      } catch (e) {
        toast({
          title: "Falha!",
          description: "Falha ao registrar o perfil!",
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
    handleChangeIpDns,
    ipdns,
  };
}
