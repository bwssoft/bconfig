import { cn } from "@/app/lib/util";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";

type Range = { from: Date; to: Date };
type Props = {
  label?: string;
  className?: string;
};
export function DateRange(props: Props) {
  const { label, className } = props;

  const [selected, setSelected] = useState<Range>({
    from: new Date(),
    to: new Date(),
  });

  const handleSelection = (props: Partial<Range>) =>
    setSelected(props as Range);

  return (
    <Popover.Root>
      <Popover.Trigger asChild>
        <div className="flex flex-col w-full">
          {label && (
            <label className="block text-sm font-medium leading-6 text-gray-900">
              {label}
            </label>
          )}
          <input
            type="button"
            className={cn(
              "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6",
              className
            )}
            value={`${selected.from.toLocaleDateString()}-${selected.to.toLocaleDateString()}`}
          />
        </div>
      </Popover.Trigger>

      <Popover.Content className="bg-white rounded-md p-2 z-50 mt-2 shadow-md">
        <DayPicker
          mode="range"
          selected={selected}
          onSelect={handleSelection}
          required={true}
        />
      </Popover.Content>
    </Popover.Root>
  );
}
