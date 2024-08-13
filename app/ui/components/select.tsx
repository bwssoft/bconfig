import { Fragment, useEffect, useState } from "react";
import {
  Label,
  Listbox,
  ListboxButton,
  ListboxOption,
  ListboxOptions,
  Transition,
} from "@headlessui/react";
import { CheckIcon, ChevronUpDownIcon } from "@heroicons/react/20/solid";
import { cn } from "@/app/lib/util/cn";

export function Select<T>(props: {
  data: T[];
  keyExtractor: (arg: T) => string | number;
  valueExtractor: (arg: T) => string | number;
  label?: string;
  onChange?: (arg: T) => void;
  name: string;
  value?: T; // Adicione a prop value
  placeholder?: string;
  error?: string;
}) {
  const {
    data,
    keyExtractor,
    valueExtractor,
    label,
    onChange,
    name,
    value,
    placeholder,
    error,
  } = props;
  const [selected, setSelected] = useState<T | undefined>(undefined);

  useEffect(() => {
    setSelected(value);
  }, [value]);

  const handleOnChange = (arg: T) => {
    setSelected(arg);
    onChange?.(arg);
  };
  return (
    <Listbox value={selected} onChange={handleOnChange} name={name}>
      {({ open }) => (
        <div className="w-full">
          {label && (
            <Label className="block text-sm font-medium leading-6 text-gray-900">
              {label}
            </Label>
          )}
          <div className={cn("relative", label && "mt-2")}>
            <ListboxButton className="relative w-full cursor-default rounded-md bg-white py-1.5 pl-3 pr-10 text-left text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-600 sm:text-sm sm:leading-6">
              <span className="block truncate">
                {selected
                  ? valueExtractor(selected)
                  : placeholder ?? "Selecione uma opção"}
              </span>
              <span className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <ChevronUpDownIcon
                  className="h-5 w-5 text-gray-400"
                  aria-hidden="true"
                />
              </span>
            </ListboxButton>

            <Transition
              show={open}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <ListboxOptions className="absolute z-10 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-base shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                {data.map((person) => (
                  <ListboxOption
                    key={keyExtractor(person)}
                    className={({ focus }) =>
                      cn(
                        focus ? "bg-blue-600 text-white" : "",
                        !focus ? "text-gray-900" : "",
                        "relative cursor-default select-none py-2 pl-8 pr-4"
                      )
                    }
                    value={person}
                  >
                    {({ selected, focus }) => (
                      <>
                        <span
                          className={cn(
                            selected ? "font-semibold" : "font-normal",
                            "block truncate"
                          )}
                        >
                          {valueExtractor(person)}
                        </span>

                        {selected ? (
                          <span
                            className={cn(
                              focus ? "text-white" : "text-blue-600",
                              "absolute inset-y-0 left-0 flex items-center pl-1.5"
                            )}
                          >
                            <CheckIcon className="h-5 w-5" aria-hidden="true" />
                          </span>
                        ) : null}
                      </>
                    )}
                  </ListboxOption>
                ))}
              </ListboxOptions>
            </Transition>
          </div>
          {error && <p className="mt-2 text-sm text-red-600">{error}</p>}
        </div>
      )}
    </Listbox>
  );
}
