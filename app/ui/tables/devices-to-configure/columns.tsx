import { ISerialPort } from "@/app/lib/definitions/serial";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "../../components/button";

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
          <Button variant="outlined">Área de Teste</Button>
          <Button variant="outlined" onClick={() => getDeviceConfig(port)}>
            Requisitar Configurações
          </Button>
        </div>
      );
    },
  },
];
