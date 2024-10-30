"use client";

import { Button } from "../../components/button";
import { Input } from "../../components/input";
import { useImeiWriterForm } from "./use-imei-writer.form";

export function ImeiWriterForm(props: {
  onSubmit: (imeiForWriting: string) => Promise<void>;
  disabled: boolean;
}) {
  const { onSubmit, disabled } = props;
  const {
    handleSubmit,
    errors,
    inputImeiRef,
    register,
    handleChangeInput,
    serial,
  } = useImeiWriterForm({
    onSubmit,
  });
  return (
    <form
      autoComplete="off"
      className="flex gap-2 items-end w-fit"
      onSubmit={handleSubmit}
    >
      <Input
        {...register("serial")}
        value={serial}
        label="Enter imei for writing"
        placeholder="Field to insert imei"
        ref={inputImeiRef}
        error={errors["serial"]?.message ?? ""}
        onChange={handleChangeInput}
      />
      <Button
        disabled={disabled}
        variant="primary"
        className="h-fit whitespace-nowrap"
        type="submit"
      >
        Write Imei
      </Button>
    </form>
  );
}
