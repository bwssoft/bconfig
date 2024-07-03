import { ISerialPort } from "@/app/lib/definitions/serial";
import { ColumnDef } from "@tanstack/react-table";

export const columns: ColumnDef<{
  imei?: string;
  iccid?: string;
  check?: string;
  port: ISerialPort;
}>[] = [
  { header: "Imei", accessorKey: "imei" },
  {
    header: "Iccid",
    accessorKey: "iccid",
  },
  // {
  //   header: "Porta.",
  //   accessorKey: "port",
  //   cell: ({ row }) => {
  //     const device = row.original;
  //     return <p>{device.port.getInfo().usbProductId}</p>;
  //   },
  // },
];
