import { IProfile } from "@/app/lib/definition";
import { ISerialPort } from "@/app/lib/definition/serial";
import { ColumnDef } from "@tanstack/react-table";
import {
  ArrowDownOnSquareIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { cn } from "@/app/lib/util";
import { Button } from "../../components/button";

const statuses = {
  fully_identified: "text-green-500 bg-green-800/20",
  partially_identified: "text-yellow-500 bg-yellow-800/20",
  not_identified: "text-rose-500 bg-rose-800/20",
};

const text = {
  fully_identified: "text-green-800",
  partially_identified: "text-yellow-800",
  not_identified: "text-rose-800",
};

export const columns: ColumnDef<{
  imei?: string;
  iccid?: string;
  et?: string;
  port: ISerialPort;
  isIdentified: boolean;
  getDeviceProfile: (port: ISerialPort) => Promise<{
    profile: IProfile["config"];
    native_profile: { cxip?: string; dns?: string; check?: string };
  } | void>;
}>[] = [
  {
    header: "Identificado",
    accessorKey: "inIdentification",
    cell: ({ row }) => {
      const device = row.original;
      const not_identified = !device.imei && !device.iccid && !device.et;
      const status = device.isIdentified
        ? "fully_identified"
        : not_identified
        ? "not_identified"
        : "partially_identified";
      return (
        <div className="flex items-center gap-1">
          <div
            className={cn(statuses[status], "flex-none rounded-full p-1 w-fit")}
          >
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
          </div>
          <div className={cn("hidden font-semibold sm:block", text[status])}>
            {device.isIdentified
              ? "Identificado"
              : not_identified
              ? "Não Identificado"
              : "Parcialmente Identificado"}
          </div>
        </div>
      );
    },
  },
  {
    header: "Imei",
    accessorKey: "imei",
    cell: ({ row }) => {
      const device = row.original;
      return <p title={device.imei}>{device.imei ?? "--"}</p>;
    },
  },
  {
    header: "Iccid",
    accessorKey: "iccid",
    cell: ({ row }) => {
      const device = row.original;
      return <p title={device.iccid}>{device.iccid ?? "--"}</p>;
    },
  },
  {
    header: "Firmware",
    accessorKey: "et",
    cell: ({ row }) => {
      const device = row.original;
      return (
        <p className="truncate w-[200px]" title={device.et}>
          {device.et ?? "--"}
        </p>
      );
    },
  },
  {
    header: "Ações",
    accessorKey: "port",
    cell: ({ row }) => {
      const device = row.original;
      const { getDeviceProfile, port } = device;
      return (
        <div className="flex gap-2">
          {/* <Button
            variant="outlined"
            className="p-2"
            title="Levar para área de teste"
          >
            <ArrowTopRightOnSquareIcon
              width={16}
              height={16}
              title="Levar para área de teste"
            />
          </Button> */}
          <Button
            variant="outlined"
            className="p-2"
            onClick={async () => {
              const result = await getDeviceProfile(port);
              if (result) {
                const uid = crypto.randomUUID();
                localStorage.setItem(`profile_${uid}`, JSON.stringify(result));
                window.open(`/configurator/actual-profile?id=${uid}`, "_blank");
              }
            }}
            title="Requisitar Configurações"
          >
            <ArrowDownOnSquareIcon
              width={16}
              height={16}
              title="Requisitar Configurações"
            />
          </Button>
        </div>
      );
    },
  },
];
