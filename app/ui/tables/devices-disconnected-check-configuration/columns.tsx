import { ISerialPort } from "@/app/lib/definition/serial";
import { ColumnDef } from "@tanstack/react-table";


export const columns: ColumnDef<{
  imei?: string;
  et?: string;
  port: ISerialPort;
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
    header: "Et",
    accessorKey: "et",
    cell: ({ row }) => {
      const device = row.original;
      return <p title={device.et}>{device.et ?? "--"}</p>;
    },
  },
];
