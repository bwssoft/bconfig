import {
  Disclosure as HDisclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/20/solid";

interface Props {
  items: {
    label: string;
    content: React.ReactNode;
  }[];
}
export default function Disclosure(props: Props) {
  const { items } = props;
  return (
    <div className="h-screen w-full mt-6">
      <div className="flex flex-col w-full divide-y divide-gray/5 rounded-xl bg-white p-6 shadow sm:rounded-lg">
        {items.map((i, idx) => (
          <HDisclosure as="div" key={idx} defaultOpen={idx === 0}>
            <DisclosureButton className="group flex w-full items-center justify-between">
              <span className="text-sm/6 font-medium text-gray group-data-[hover]:text-gray/80">
                {i.label}
              </span>
              <ChevronDownIcon className="size-5 fill-gray/60 group-data-[hover]:fill-gray/50 group-data-[open]:rotate-180" />
            </DisclosureButton>
            <DisclosurePanel className="mt-2 text-sm/5 text-gray/50">
              {i.content}
            </DisclosurePanel>
          </HDisclosure>
        ))}
      </div>
    </div>
  );
}
