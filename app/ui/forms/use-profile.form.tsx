import { economyMode } from "@/app/constants/e3+config";
import { createOneProfile } from "@/app/lib/action";
import { E3Encoder } from "@/app/lib/encoder/e3+";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  name: z.string(),
  model: z.enum(["E3+", "E3+4G"]),
  password: z.object({ old: z.string(), new: z.string() }).optional(),
  apn: z
    .object({
      address: z.string(),
      user: z.string(),
      password: z.string(),
    })
    .optional(),
  ip: z
    .object({
      primary: z.object({
        ip: z.string(),
        port: z.string(),
      }),
      secondary: z.object({
        ip: z.string(),
        port: z.string(),
      }),
    })
    .optional(),
  dns: z
    .object({
      address: z.string(),
      port: z.string(),
    })
    .optional(),
  timezone: z.coerce.number().optional(),
  lock_type: z.coerce.number().optional(),
  data_transmission: z
    .object({
      on: z.string(),
      off: z.string(),
    })
    .optional(),
  odometer: z.coerce.number().optional(),
  keep_alive: z.coerce.number().optional(),
  accelerometer_sensitivity: z.coerce.number().optional(),
  economy_mode: z.coerce.number().optional(),
  sensitivity_adjustment: z.coerce.number().optional(),
  lbs_position: z.coerce.boolean().optional().default(false),
  cornering_position_update: z.coerce.boolean().optional().default(false),
  ignition_alert_power_cut: z.coerce.boolean().optional().default(false),
  gprs_failure_alert: z.coerce.boolean().optional().default(false),
  led: z.coerce.boolean().optional().default(false),
  virtual_ignition: z.coerce.boolean().optional().default(false),
  // panic_button: z.coerce.boolean().optional().default(false),
  // module_violation: z.coerce.boolean().optional().default(false),
});

export type Schema = z.infer<typeof schema>;

interface Props {
  defaultValues?: Schema;
  onSubmit?: (commands: string[]) => Promise<void>;
}
export function useProfileCreateForm(props: Props) {
  const { defaultValues, onSubmit } = props;
  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    setValue,
    reset: hookFormReset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  const [ipdns, setIpdns] = useState<"IP" | "DNS">("IP");
  const handleChangeIpDns = (value: "IP" | "DNS") => {
    setIpdns(value);
  };

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const { name, model, ...config } = data;
      await createOneProfile({ name, model, config });
    } catch (e) {
      console.error("error on submit form", e);
    }
  });

  useEffect(() => {
    if (defaultValues) {
      hookFormReset(defaultValues);
    }
  }, [defaultValues, hookFormReset]);

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
