import { useEffect, useState } from "react";
import { Switch } from "@headlessui/react";
import { cn } from "@/app/lib/util";

interface Props {
  onChange?: (arg: boolean) => void;
  value?: boolean;
}
export default function Toggle(props: Props) {
  const { onChange, value } = props;
  const [enabled, setEnabled] = useState(false);
  const handleChange = (arg: boolean) => {
    setEnabled(arg);
    onChange?.(arg);
  };

  useEffect(() => {
    typeof value === "boolean" && setEnabled(value);
  }, [value]);

  return (
    <Switch
      checked={enabled}
      onChange={handleChange}
      className={cn(
        enabled ? "bg-blue-600" : "bg-gray-200",
        "relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
      )}
    >
      <span className="sr-only">Use setting</span>
      <span
        aria-hidden="true"
        className={cn(
          enabled ? "translate-x-5" : "translate-x-0",
          "pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"
        )}
      />
    </Switch>
  );
}
