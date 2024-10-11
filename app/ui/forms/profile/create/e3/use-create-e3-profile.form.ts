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

const max_speed = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .min(0, { message: "O valor deve ser no mínimo 0" })
  .max(255, { message: "O valor deve ser no máximo 255" })
  .optional()

const sleep = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .min(1, { message: "O valor deve ser no mínimmo 1" })
  .max(5, { message: "O valor deve ser no máximo 5" })
  .optional()

const removePropByOptionalFunctions = <T>(schema: T) => {
  const optional_functions = (schema as any).optional_functions
  if (!optional_functions) return schema
  const parsed = JSON.parse(JSON.stringify(schema))
  Object.entries(optional_functions).forEach(([key, value]) => {
    if (!value) {
      delete parsed[key]
    }
  })
  return parsed as T
}

const schema = z.preprocess(removeEmptyValues, z
  .object({
    name: z.string({ message: "O nome é orbigatório" }),
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
    operation_mode: z.coerce.boolean().optional(),
    optional_functions: z.record(z.string(), z.boolean()).optional(),
    max_speed: max_speed,
    sleep: sleep,
    // panic_button: z.coerce.boolean().optional().default(false),
    // module_violation: z.coerce.boolean().optional().default(false),
  })).transform(removeUndefined).transform(removePropByOptionalFunctions)

export type Schema = z.infer<typeof schema>;


export function useE3ProfileCreateForm() {
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
        const { name, optional_functions, ...config } = data;
        await createOneProfile({
          name,
          config,
          optional_functions,
          model: "E3+" as IProfile["model"]
        });
        toast({
          title: "Sucesso!",
          description: "Perfil registrado com sucesso!",
          variant: "success",
        })
      } catch (e) {
        console.error(e)
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
