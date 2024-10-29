"use client";
//tava reclamando da função cell nas colunas

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";
import { ISerialPort } from "@/app/lib/definition/serial";
import { IUser } from "@/app/lib/definition";

interface Props {
  data: {
    id: string;
    port: ISerialPort;
    imei?: string;
    iccid?: string;
    is_configured: boolean;
    not_configured: any;
    profile_name: string;
    model: string;
  }[];
  user_type: IUser["type"];
}
export default function DeviceConfiguredTable(props: Props) {
  const { data, user_type } = props;
  return (
    <DataTable
      columns={columns(user_type)}
      data={data}
      mobileDisplayValue={(data) =>
        `${data.imei} ${data.is_configured ? "Configurado" : "Não Configurado"}`
      }
      mobileKeyExtractor={() => Math.random().toString()}
      className="mt-5 w-full"
      theadClassName="[&_tr]:border-b bg-white border-b-1 border-b-gray-200"
    />
  );
}
