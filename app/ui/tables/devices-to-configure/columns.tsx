import { ISerialPort } from "@/app/lib/definition/serial";
import { ColumnDef } from "@tanstack/react-table";

const className =
  "underline underline-offset-2 font-semibold text-blue-600 hover:text-blue-500 hover:cursor-pointer";
export const columns: ColumnDef<{
  imei?: string;
  iccid?: string;
  et?: string;
  port: ISerialPort;
  getDeviceConfig: (port: ISerialPort) => Promise<void>;
}>[] = [
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
    header: "Firmeware",
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
      const { getDeviceConfig, port } = device;
      return (
        <div className="flex gap-2">
          <p className={className}>Área de Teste</p> |
          <p className={className} onClick={() => getDeviceConfig(port)}>
            Resgatar Configurações
          </p>
        </div>
      );
    },
  },
];
