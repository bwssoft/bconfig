import { economyMode } from "@/app/constants/e3+config";
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
});

export type Schema = z.infer<typeof schema>;

interface Props {
  defaultValues?: Schema;
}
export function useConfigE3Form(props: Props) {
  const { defaultValues } = props;
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
      //fazer a request
      const commands: string[] = [];
      Object.entries(data).forEach(([command, args]) => {
        const _command = E3Encoder.encoder({ command, args } as any);
        if (_command) {
          commands.push(...(Array.isArray(_command) ? _command : [_command]));
        }
      });
      console.log("commands", commands);
    } catch (e) {
      console.log(e);
    }
  });

  useEffect(() => console.log("errors", errors), [errors]);

  useEffect(() => {
    console.log(defaultValues);
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
