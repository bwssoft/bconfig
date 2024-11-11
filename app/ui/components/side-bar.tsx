"use client";
import {
  ForwardRefExoticComponent,
  RefAttributes,
  SVGProps,
  useState,
} from "react";
import {
  Dialog,
  DialogPanel,
  Transition,
  TransitionChild,
} from "@headlessui/react";
import {
  Bars3Icon,
  CalendarIcon,
  ChartPieIcon,
  FolderIcon,
  HomeIcon,
  UsersIcon,
  XMarkIcon,
  ClipboardIcon,
  ChevronRightIcon,
  CpuChipIcon,
  WrenchIcon,
  BriefcaseIcon,
  RectangleStackIcon,
  ArrowRightEndOnRectangleIcon,
} from "@heroicons/react/24/outline";
import {
  Disclosure,
  DisclosureButton,
  DisclosurePanel,
} from "@headlessui/react";
import { cn } from "@/app/lib/util";
import Link from "next/link";
import { useIsOnPathname } from "@/app/hook/is-on-pathname";
import { Button } from "./button";
import { IUser } from "@/app/lib/definition";
import { useRouter } from "next/navigation";

export type NavItem = {
  name: string;
  icon?: ForwardRefExoticComponent<
    Omit<SVGProps<SVGSVGElement>, "ref"> & {
      title?: string | undefined;
      titleId?: string | undefined;
    } & RefAttributes<SVGSVGElement>
  >;
  pathname?: string;
  children?: NavItem[];
};

const getPaddingClass = (depth: number) => {
  switch (depth) {
    case 0:
      return "";
    case 1:
      return "pl-5";
    case 2:
      return "pl-8";
    default:
      return `pl-${9 + (depth - 1) * 3}`;
  }
};

interface Props {
  user: Omit<IUser, "password">;
  logout: () => Promise<void>;
}

const employeeNavigation: NavItem[] = [
  { name: "Dashboard", icon: HomeIcon, pathname: "/dashboard" },
  { name: "Configuration Profile", pathname: "/profile", icon: UsersIcon },
  {
    name: "Logs",
    icon: Bars3Icon,
    children: [
      {
        name: "Configuration Logs",
        pathname: "/configuration-log",
      },
      {
        name: "Auto Test Logs",
        pathname: "/auto-test-log",
      },
    ],
  },
  {
    name: "Tools",
    icon: WrenchIcon,
    children: [
      {
        name: "E3+",
        children: [{ name: "Configurator", pathname: "/configurator/E3+" }],
      },
      {
        name: "E3+4G",
        children: [
          { name: "Configurator", pathname: "/configurator/E3+4G" },
          { name: "AUTO Test", pathname: "/auto-test/E3+4G" },
          { name: "Imei Writer", pathname: "/imei-writer/E3+4G" },
        ],
      },
    ],
  },
];

const clientNavigation: NavItem[] = [
  { name: "Dashboard", icon: HomeIcon, pathname: "/" },
  { name: "Configuration", pathname: "/configuration", icon: WrenchIcon },
];

const externalNavigation: NavItem[] = [];

const navigation: { [key in "client" | "employee" | "external"]: NavItem[] } = {
  client: clientNavigation,
  employee: employeeNavigation,
  external: externalNavigation,
};

export function SideBar(props: Props) {
  const { user, logout } = props;
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isOnPathname = useIsOnPathname();
  const router = useRouter();

  const renderNavItem = (item: NavItem, depth = 0) => {
    const paddingLeft = getPaddingClass(depth); // Calcula o padding-left baseado na profundidade
    return (
      <li key={item.name}>
        {!item?.children ? (
          <Link
            href={item.pathname ?? "#"}
            className={cn(
              isOnPathname(item.pathname)
                ? "bg-gray-50"
                : "hover:bg-gray-50 pl-",
              "group flex gap-x-3 rounded-md p-2 text-sm font-semibold leading-6 text-gray-700",
              paddingLeft // Adiciona padding-left baseado na profundidade
            )}
          >
            {item.icon && (
              <item.icon
                className="h-6 w-6 shrink-0 text-gray-400"
                aria-hidden="true"
              />
            )}
            {item.name}
          </Link>
        ) : (
          <Disclosure as="div">
            {({ open }) => (
              <>
                <Disclosure.Button
                  className={cn(
                    isOnPathname(item.pathname)
                      ? "bg-gray-50"
                      : "hover:bg-gray-50",
                    "flex w-full items-center gap-x-3 rounded-md p-2 text-left text-sm font-semibold leading-6 text-gray-700",
                    paddingLeft // Adiciona padding-left baseado na profundidade
                  )}
                >
                  {item?.icon && (
                    <item.icon
                      className="h-6 w-6 shrink-0 text-gray-400"
                      aria-hidden="true"
                    />
                  )}
                  {item.name}
                  <ChevronRightIcon
                    className={cn(
                      open ? "rotate-90 text-gray-500" : "text-gray-400",
                      "ml-auto h-5 w-5 shrink-0"
                    )}
                    aria-hidden="true"
                  />
                </Disclosure.Button>
                <Disclosure.Panel as="ul" className="mt-1">
                  {item?.children?.map((subItem) =>
                    renderNavItem(subItem, depth + 1)
                  )}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        )}
      </li>
    );
  };

  return (
    <>
      <div>
        <Transition show={sidebarOpen}>
          <Dialog className="relative z-50 lg:hidden" onClose={setSidebarOpen}>
            <TransitionChild
              enter="transition-opacity ease-linear duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="transition-opacity ease-linear duration-300"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-gray-900/80" />
            </TransitionChild>

            <div className="fixed inset-0 flex">
              <TransitionChild
                enter="transition ease-in-out duration-300 transform"
                enterFrom="-translate-x-full"
                enterTo="translate-x-0"
                leave="transition ease-in-out duration-300 transform"
                leaveFrom="translate-x-0"
                leaveTo="-translate-x-full"
              >
                <DialogPanel className="relative mr-16 flex w-full max-w-xs flex-1">
                  <TransitionChild
                    enter="ease-in-out duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="ease-in-out duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute left-full top-0 flex w-16 justify-center pt-5">
                      <button
                        type="button"
                        className="-m-2.5 p-2.5"
                        onClick={() => setSidebarOpen(false)}
                      >
                        <span className="sr-only">Close sidebar</span>
                        <XMarkIcon
                          className="h-6 w-6 text-white"
                          aria-hidden="true"
                        />
                      </button>
                    </div>
                  </TransitionChild>
                  {/* Sidebar component, swap this element with another sidebar if you like */}
                  <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-white px-6 pb-2">
                    <div className="flex h-16 shrink-0 items-center">
                      <img
                        className="h-8 w-auto"
                        src="/logo-bws.png"
                        alt="Your Company"
                      />
                    </div>
                    <nav className="flex flex-1 flex-col">
                      <ul role="list" className="flex flex-1 flex-col gap-y-7">
                        <li>
                          <ul role="list" className="-mx-2 space-y-1">
                            {navigation[user.type ?? "employee"].map((item) =>
                              renderNavItem(item)
                            )}
                          </ul>
                        </li>
                      </ul>
                    </nav>
                  </div>
                </DialogPanel>
              </TransitionChild>
            </div>
          </Dialog>
        </Transition>

        {/* Static sidebar for desktop */}
        <div className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-72 lg:flex-col">
          {/* Sidebar component, swap this element with another sidebar if you like */}
          <div className="flex grow flex-col gap-y-5 overflow-y-auto border-r border-gray-200 bg-white px-6">
            <div className="flex h-16 shrink-0 items-center">
              <img
                className="h-8 w-auto"
                src="/logo-bws.png"
                alt="Your Company"
              />
            </div>
            <nav className="flex flex-1 flex-col">
              <ul role="list" className="flex flex-1 flex-col gap-y-7">
                <li>
                  <ul role="list" className="-mx-2 space-y-1">
                    {navigation[user.type ?? "external"].map((item) =>
                      renderNavItem(item)
                    )}
                  </ul>
                </li>
                <li className="-mx-6 mt-auto flex items-center justify-between">
                  <a
                    href="#"
                    className="flex items-center gap-x-4 px-6 py-3 text-sm font-semibold leading-6 text-gray-900 hover:bg-gray-50"
                  >
                    <img
                      className="h-8 w-8 rounded-full bg-gray-50"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                    <span className="sr-only">Your profile</span>
                    <span aria-hidden="true">{user.name}</span>
                  </a>
                  <form
                    action={async () => {
                      await logout();
                      router.push("/login");
                    }}
                    className="px-6 py-3"
                  >
                    <Button variant="outlined" type="submit" title="Logout">
                      <ArrowRightEndOnRectangleIcon
                        height={18}
                        width={18}
                        className="rotate-180"
                      />
                    </Button>
                  </form>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="sticky top-0 z-40 flex items-center gap-x-6 bg-white px-4 py-4 shadow-sm sm:px-6 lg:hidden">
          <button
            type="button"
            className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
            onClick={() => setSidebarOpen(true)}
          >
            <span className="sr-only">Open sidebar</span>
            <Bars3Icon className="h-6 w-6" aria-hidden="true" />
          </button>
          <div className="flex-1 text-sm font-semibold leading-6 text-gray-900">
            Dashboard
          </div>
          <a href="#">
            <span className="sr-only">Your profile</span>
            <img
              className="h-8 w-8 rounded-full bg-gray-50"
              src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
              alt=""
            />
          </a>
        </div>
      </div>
    </>
  );
}
