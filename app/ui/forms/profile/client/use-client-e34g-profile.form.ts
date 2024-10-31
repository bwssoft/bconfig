import { toast } from "@/app/hook/use-toast";
import { createOneProfile, updateOneProfileById } from "@/app/lib/action";
import { IProfile } from "@/app/lib/definition";
import { removeEmptyValues, removeNull, removeUndefined } from "@/app/lib/util";
import { formatSearchParams } from "@/app/lib/util/format-search-params";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const password = z
  .string()
  .max(6, { message: "A senha deve ter no máximo 6 caracteres." })
  .optional()
  .nullable()

const data_transmission = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .max(3600, { message: "O valor deve ser no máximo 65535" })
  .optional()
  .nullable()

const ip = z
  .string()
  .ip({ message: "IP inválido." })
  .optional()
  .nullable()

const port = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .optional()
  .nullable()

const sensitivity_adjustment = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .min(30, { message: "O valor deve ser no mínimo 30" })
  .max(1000, { message: "O valor deve ser no máximo 1000" })
  .optional()
  .nullable()

const keep_alive = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .min(60, { message: "O valor deve ser no mínimo 60" })
  .max(3600, { message: "O valor deve ser no máximo 3600" })
  .optional()
  .nullable()

const odometer = z
  .coerce
  .number()
  .min(0, { message: "O valor deve ser no mínimo 0" })
  .max(65535, { message: "O valor deve ser no máximo 65535" })
  .optional()
  .nullable()

const horimeter = z
  .coerce
  .number()
  .min(0, { message: "O valor deve ser no mínimo 0" })
  .max(65535, { message: "O valor deve ser no máximo 65535" })
  .optional()
  .nullable()

const max_speed = z
  .coerce
  .number()
  .min(0, { message: "O valor deve ser no mínimo 0" })
  .max(255, { message: "O valor deve ser no máximo 255" })
  .optional()
  .nullable()

const angle_adjustment = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .min(5, { message: "O valor deve ser no mínimmo 5" })
  .max(90, { message: "O valor deve ser no máximo 90" })
  .optional()
  .nullable()

const lock_type_progression = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .max(60000, { message: "O valor deve ser no máximo 60000" })
  .nullable()


const ignition_by_voltage = z
  .coerce
  .number()
  .positive({ message: "O valor deve ser positivo" })
  .max(65535, { message: "O valor deve ser no máximo 65535" })
  .nullable()


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
    password: z.object({ old: password, new: password }).optional().nullable(),
    apn: z
      .object({
        address: z.string().optional().nullable(),
        user: z.string().optional().nullable(),
        password: z.string().optional().nullable(),
      })
      .optional().nullable(),
    ip: z
      .object({
        primary: z.object({
          ip: ip,
          port: port,
        }).optional().nullable().refine(
          (data) => (!data?.ip?.length && !data?.port) || (data?.ip && data.port),
          { message: "Ambos 'ip' e 'port' devem estar preenchidos ou ambos devem estar ausentes." }
        ),
        secondary: z.object({
          ip: ip,
          port: port,
        }).optional().nullable().refine(
          (data) => (!data?.ip?.length && !data?.port) || (data?.ip && data.port),
          { message: "Ambos 'ip' e 'port' devem estar preenchidos ou ambos devem estar ausentes." }
        ),
      })
      .optional().nullable(),
    dns: z
      .object({
        address: z.string().optional().nullable(),
        port: port,
      })
      .optional().nullable(),
    timezone: z.coerce.number().optional().nullable(),
    lock_type: z.coerce.number().optional().nullable(),
    data_transmission: z
      .object({
        on: data_transmission,
        off: data_transmission,
      })
      .optional().nullable(),
    odometer: odometer,
    keep_alive: keep_alive,
    economy_mode: z.coerce.number().optional().nullable(),
    sensitivity_adjustment: sensitivity_adjustment,
    lbs_position: z.coerce.boolean().optional().default(false),
    cornering_position_update: z.coerce.boolean().optional().default(false),
    led: z.coerce.boolean().optional().default(false),
    virtual_ignition: z.coerce.boolean().optional().default(false),
    virtual_ignition_by_voltage: z.coerce.boolean().optional().default(false),
    virtual_ignition_by_movement: z.coerce.boolean().optional().default(false),
    optional_functions: z.record(z.string(), z.boolean()).optional().nullable(),
    max_speed: max_speed,
    communication_type: z.string().optional().nullable(),
    protocol_type: z.string().optional().nullable(),
    anti_theft: z.coerce.boolean().optional().default(false),
    horimeter: horimeter,
    jammer_detection: z.coerce.boolean().optional().default(false),
    input_1: z.number().optional().nullable(),
    input_2: z.number().optional().nullable(),
    angle_adjustment: angle_adjustment,
    lock_type_progression: z
      .object({
        n1: lock_type_progression,
        n2: lock_type_progression,
      })
      .optional().nullable(),
    ignition_by_voltage: z
      .object({
        t1: ignition_by_voltage,
        t2: ignition_by_voltage,
      })
      .refine((data) => data.t1 !== undefined && data.t2 !== undefined, {
        message: "VION e VIOFF devem ser preenchidos.",
        path: ["t1"]
      })
      .refine((data) => data.t1! > data.t2!, {
        message: "VION deve ser maior do que VIOFF.",
        path: ["t1"]
      }).optional().nullable(),
  })).transform(removeUndefined).transform(removeNull).transform(removePropByOptionalFunctions)

export type Schema = z.infer<typeof schema>;

const resetValues = {
  password: null,
  apn: null,
  ip: null,
  dns: null,
  timezone: null,
  lock_type: null,
  data_transmission: null,
  odometer: null,
  keep_alive: null,
  economy_mode: null,
  sensitivity_adjustment: null,
  optional_functions: null,
  max_speed: null,
  communication_type: null,
  protocol_type: null,
  horimeter: null,
  clear_buffer: null,
  clear_horimeter: null,
  input_1: null,
  input_2: null,
  angle_adjustment: null,
  lock_type_progression: null,
  ignition_by_voltage: null,

  lbs_position: false,
  cornering_position_update: false,
  led: false,
  accel: false,
  virtual_ignition: false,
  jammer_detection: false,
  anti_theft: false,
  virtual_ignition_by_voltage: false
};

interface Props {
  defaultValues?: IProfile;
  onSubmit: (profile: Omit<IProfile, 'created_at' | "user_id">) => Promise<void>
}

export function useClientE34GProfileForm(props: Props) {
  const { defaultValues, onSubmit } = props;

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const router = useRouter()

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    setValue,
    watch,
    reset: hookFormReset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues
  });

  const [ipdns, setIpdns] = useState<"IP" | "DNS">("IP");
  const handleChangeIpDns = (value: "IP" | "DNS") => {
    setIpdns(value);
  };

  const lockType = watch("lock_type")

  const handleSubmit = hookFormSubmit(
    async (data) => {
      let id = searchParams.get("id")
      const { name, optional_functions, ...config } = data;
      const profile = {
        name,
        config: config as IProfile["config"],
        optional_functions: optional_functions as IProfile["optional_functions"],
        model: "E3+4G" as IProfile["model"],
        is_for_customer: true
      }
      try {
        if (id) {
          await updateOneProfileById({ id }, profile);
        } else {
          const profileCreated = await createOneProfile(profile);
          id = profileCreated.id
        }
        await onSubmit({ ...profile, id })
      } catch (e) {
        const action = id ? "atualizar" : "cadastrar"
        toast({
          title: "Falha!",
          description: `Falha ao ${action} o perfil!`,
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
    }
  );

  const handleProfileSelection = (id?: string) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams({ id }, old_params);
    router.push(`${pathname}?${params}`);
  };

  const handleChangeName = (name: string) => setValue("name", name)

  function resetAllFields() {
    const name = watch("name")
    hookFormReset({ ...resetValues, name });
  }

  useEffect(() => {
    if (defaultValues) {
      const { name, config, optional_functions } = defaultValues
      const isIp = !!config?.ip
      handleChangeIpDns(isIp ? "IP" : "DNS")
      hookFormReset({ name, optional_functions, ...config });
    }
  }, [defaultValues, hookFormReset]);

  useEffect(() => {
    console.log("errors", errors)
  }, [errors]);
  return {
    register,
    handleSubmit,
    errors,
    control,
    setValue,
    reset: hookFormReset,
    handleChangeIpDns,
    ipdns,
    lockType,
    watch,
    handleProfileSelection,
    handleChangeName,
    resetAllFields
  };
}


