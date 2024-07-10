"use client";
//tava reclamando da função cell nas colunas

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";
import { ISerialPort } from "@/app/lib/definition/serial";
import { IProfile } from "@/app/lib/definition";

interface Props {
  data: {
    imei?: string;
    iccid?: string;
    et?: string;
    port: ISerialPort;
    isIdentified: boolean;
    getDeviceProfile: (port: ISerialPort) => Promise<IProfile["config"] | void>;
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
      theadClassName="[&_tr]:border-b bg-white border-b-1 border-b-gray-200"
    />
  );
}
