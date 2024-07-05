import { economyMode } from "@/app/constants/e3+config";
import { createOneProfile } from "@/app/lib/action";
import { E3Encoder } from "@/app/lib/encoder/e3+";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
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
      primary: z
        .object({
          ip: z.string(),
          port: z.string(),
        })
        .optional(),
      secondary: z
        .object({
          ip: z.string(),
          port: z.string(),
        })
        .optional(),
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
  lbs_position: z.coerce.boolean().optional(),
  cornering_position_update: z.coerce.boolean().optional(),
  ignition_alert_power_cut: z.coerce.boolean().optional(),
  gprs_failure_alert: z.coerce.boolean().optional(),
  led: z.coerce.boolean().optional(),
  virtual_ignition: z.coerce.boolean().optional(),
  // panic_button: z.coerce.boolean().optional(),
  // module_violation: z.coerce.boolean().optional(),
});

export type Schema = z.infer<typeof schema>;

interface Props {
  defaultValues?: Schema;
  onSubmit?: (commands: string[]) => Promise<void>;
}
export function useConfigE3Form(props: Props) {
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

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      console.log("data", data);
      const commands: string[] = [];
      Object.entries(data).forEach(([command, args]) => {
        const _command = E3Encoder.encoder({ command, args } as any);
        console.log(command, _command);
        if (_command) {
          commands.push(...(Array.isArray(_command) ? _command : [_command]));
        }
      });
      // await onSubmit?.(["REG000000#", "SMS1", "EN", "IMEI", ...commands]);
    } catch (e) {
      console.error("error on submit form", e);
    }
  });

  useEffect(() => {
    console.log("defaultValues", defaultValues);
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
  };
}
