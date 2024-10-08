import { isIMEI } from "@/app/lib/util/is-imei";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

const serial = z
  .coerce
  .string({ message: "This field is required." })
  .min(15, { message: "At least 15 characters." })
  .max(15, { message: "Maximum 15 characters." })
  .refine(isIMEI, { message: "Enter a valid imei." })

const schema = z.object({
  serial,
})

export type Schema = z.infer<typeof schema>;

export function useImeiWriterForm(props: { onSubmit: (imeiForWriting: string) => Promise<void> }) {
  const { onSubmit } = props

  const {
    register,
    handleSubmit: hookFormSubmit,
    formState: { errors },
    control,
    setValue,
    reset: hookFormReset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
    mode: "onChange"
  });

  const handleSubmit = hookFormSubmit(async (data) => {
    const { serial } = data
    await onSubmit(serial)
  })

  // estado, função e use effect para lidar com o auto focus no input a partir de dois apertos na tecla espaço
  const [lastPressTime, setLastPressTime] = useState<number | null>(null);
  const inputImeiRef = useRef<HTMLInputElement | null>(null);
  const handleKeyDown = (event: KeyboardEvent) => {
    if (event.code === 'Space') {
      const currentTime = new Date().getTime();
      if (lastPressTime && currentTime - lastPressTime < 300) {
        event.preventDefault()
        inputImeiRef.current?.focus()
        inputImeiRef.current && (inputImeiRef.current.value = "")
      }
      setLastPressTime(currentTime);
    }
  };


  const handleChangeInput = (event: React.ChangeEvent<HTMLInputElement>) => {
    const imei = event.target.value;
    setValue("serial", imei, { shouldValidate: true }); // Ensure validation happens on every change
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [lastPressTime]);

  return {
    register,
    handleSubmit,
    errors,
    control,
    setValue,
    reset: hookFormReset,
    inputImeiRef,
    handleChangeInput
  };
}
