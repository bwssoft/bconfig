"use client";
//tava reclamando da função cell nas colunas

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";
import { ISerialPort } from "@/app/lib/definitions/serial";

interface Props {
  data: { answer?: string; command: string; port: ISerialPort }[];
}
export default function ConfigurationLogTable(props: Props) {
  const { data } = props;
  return (
    <DataTable
      columns={columns}
      data={data}
      mobileDisplayValue={(data) => `${data.command} ${data.answer ?? "--"}`}
      mobileKeyExtractor={() => Math.random().toString()}
      className="w-full"
      theadClassName="[&_tr]:border-b bg-white border-b-1 border-b-gray-200"
    />
  );
}
