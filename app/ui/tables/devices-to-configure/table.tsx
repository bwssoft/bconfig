"use client";
//tava reclamando da função cell nas colunas

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";
import { ISerialPort } from "@/app/lib/definitions/serial";

interface Props {
  data: {
    imei?: string;
    iccid?: string;
    et?: string;
    port: ISerialPort;
    getDeviceConfig: (port: ISerialPort) => Promise<void>;
  }[];
}
export default function DevicesToConfigureTable(props: Props) {
  const { data } = props;
  return (
    <DataTable
      columns={columns}
      data={data}
      mobileDisplayValue={(data) => data.imei}
      mobileKeyExtractor={() => Math.random().toString()}
      className="w-full"
      tdClassName="py-0"
      thClassName="py-0"
      theadClassName="![&_tr]:border-b-0 border-b-0 border-b-white"
    />
  );
}
