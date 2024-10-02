"use client";
//tava reclamando da função cell nas colunas

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";
import { ISerialPort } from "@/app/lib/definition/serial";

interface Props {
  data: {
    id: string;
    port: ISerialPort;
    previous_imei: string;
    desired_imei: string;
    iccid?: string;
    is_configured: boolean;
  }[];
}
export default function DeviceConfiguredImeiTable(props: Props) {
  const { data } = props;
  return (
    <DataTable
      columns={columns}
      data={data}
      mobileDisplayValue={(data) =>
        `Antes: ${data.previous_imei} - Depois: ${data.desired_imei} - ${
          data.is_configured ? "Configurado" : "Não Configurado"
        }`
      }
      mobileKeyExtractor={() => Math.random().toString()}
      className="mt-5 w-full"
      theadClassName="[&_tr]:border-b bg-white border-b-1 border-b-gray-200"
    />
  );
}
