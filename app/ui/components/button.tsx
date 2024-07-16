"use client";
import { cn } from "@/app/lib/util/cn";
import { useFormStatus } from "react-dom";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  // Adicione quaisquer propriedades adicionais aqui, se necessário
  variant: "outlined" | "primary";
}

const styles = {
  outlined:
    "inline-flex items-center justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50",
  primary:
    "inline-flex items-center justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600",
};

export const Button: React.FC<ButtonProps> = (props) => {
  const { pending } = useFormStatus();
  return (
    <button
      disabled={pending}
      {...props}
      className={cn(
        styles[props.variant],
        props.className,
        pending && "opacity-30"
      )}
    >
      {props.children}
    </button>
  );
};
