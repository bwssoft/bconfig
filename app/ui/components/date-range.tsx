import { cn } from "@/app/lib/util";
import * as Popover from "@radix-ui/react-popover";
import { useState } from "react";
import { DayPicker } from "react-day-picker";
import "react-day-picker/style.css";
import { Input } from "./input";
import { ptBR } from "date-fns/locale";

type Range = { from: Date; to: Date };

type Props = {
  label?: string;
  className?: string;
  range?: Range;
  onChange?: (range: Range) => void;
};

export function DateRange(props: Props) {
  const { label, className, range, onChange } = props;

  const [selected, setSelected] = useState<Range>({
    from: range?.from ?? new Date(),
    to: range?.to ?? new Date(),
  });

  const handleSelection = (props: Partial<Range>) => {
    setSelected(() => {
      const range = props as Range;
      onChange?.(range);
      return range;
    });
  };

  const handleHourChange = (
    event: React.ChangeEvent<HTMLInputElement>,
    mode: "from" | "to"
  ) => {
    const time = event.target.value;
    if (selected[mode]) {
      const [hours, minutes] = time.split(":").map(Number);
      const updatedFrom = new Date(selected[mode]);
      updatedFrom.setHours(hours, minutes);
      setSelected((prev) => {
        const range = {
          ...prev,
          [mode]: updatedFrom,
        };
        onChange?.(range);
        return range;
      });
    }
  };

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
              "block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6",
              label && "mt-2",
              className
            )}
            value={`${selected.from.toLocaleString()} - ${selected.to.toLocaleString()}`}
          />
        </div>
      </Popover.Trigger>

      <Popover.Content className="bg-white rounded-md p-2 z-50 mt-2 shadow-md">
        <DayPicker
          locale={ptBR}
          mode="range"
          selected={selected}
          onSelect={handleSelection}
          required={true}
          footer={
            <div className="flex gap-2 w-full">
              <Input
                label="Hora data inicial"
                name="from-hour"
                type="time"
                value={
                  selected.from
                    ? selected.from.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""
                }
                onChange={(e) => handleHourChange(e, "from")}
              />
              <Input
                label="Hora data final"
                name="to-hour"
                type="time"
                value={
                  selected.to
                    ? selected.to.toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })
                    : ""
                }
                onChange={(e) => handleHourChange(e, "to")}
              />
            </div>
          }
        />
      </Popover.Content>
    </Popover.Root>
  );
}
