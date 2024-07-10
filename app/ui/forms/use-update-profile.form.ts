import { createOneProfile, updateOneProfileById } from "@/app/lib/action";
import { removeUndefined } from "@/app/lib/util";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const numberTransform = (number?: number) =>
  number === 0 ? undefined : number;

const stringTransform = (str?: string) => (str === "" ? undefined : str);

const zodNumber = z.coerce.number().optional().transform(numberTransform);
const zodString = z.string().optional().transform(stringTransform);
const schema = z
  .object({
    name: z.string(),
    model: z.enum(["E3+", "E3+4G"]),
    password: z.object({ old: zodString, new: zodString }).optional(),
    apn: z
      .object({
        address: zodString,
        user: zodString,
        password: zodString,
      })
      .optional(),
    ip: z
      .object({
        primary: z.object({
          ip: zodString,
          port: zodString,
        }),
        secondary: z.object({
          ip: zodString,
          port: zodString,
        }),
      })
      .optional(),
    dns: z
      .object({
        address: zodString,
        port: zodString,
      })
      .optional(),
    timezone: zodNumber,
    lock_type: zodNumber,
    data_transmission: z
      .object({
        on: zodString,
        off: zodString,
      })
      .optional(),
    odometer: zodNumber,
    keep_alive: zodNumber,
    accelerometer_sensitivity: zodNumber,
    economy_mode: zodNumber,
    sensitivity_adjustment: zodNumber,
    lbs_position: z.coerce.boolean().optional().default(false),
    cornering_position_update: z.coerce.boolean().optional().default(false),
    ignition_alert_power_cut: z.coerce.boolean().optional().default(false),
    gprs_failure_alert: z.coerce.boolean().optional().default(false),
    led: z.coerce.boolean().optional().default(false),
    virtual_ignition: z.coerce.boolean().optional().default(false),
    // panic_button: z.coerce.boolean().optional().default(false),
    // module_violation: z.coerce.boolean().optional().default(false),
  })
  .transform((value) => removeUndefined(value));

export type Schema = z.infer<typeof schema>;

interface Props {
  defaultValues?: Schema;
}
export function useProfileUpdateForm(props: Props) {
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
      const { name, model, ...config } = data;
      console.log('config.economy_mode', config.economy_mode)
      await updateOneProfileById({ id: defaultValues.id }, { name, model, config });
    } catch (e) {
      console.error("error on submit form", e);
    }
  });

  useEffect(() => {
    console.log('errors', errors)
  }, [errors])

  useEffect(() => {
    if (defaultValues) {
      const { name, model, config } = defaultValues
      hookFormReset({ name, model, ...config });
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
