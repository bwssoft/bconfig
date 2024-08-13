"use client";
//tava reclamando da função cell nas colunas

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";
import { IUser, TestMetadata } from "@/app/lib/definition";

interface Props {
  data: {
    id: string;
    imei: string;
    is_successful: boolean;
    created_at: Date;
    metadata: TestMetadata;
    user: IUser;
  }[];
}
export default function AutoTestLogTable(props: Props) {
  const { data } = props;
  return (
    <DataTable
      columns={columns}
      data={data}
      mobileDisplayValue={(data) =>
        `${data.imei} ${data.is_successful ? "Success" : "Fail"}`
      }
      mobileKeyExtractor={() => Math.random().toString()}
      className="mt-6 w-full"
      theadClassName="[&_tr]:border-b bg-white border-b-1 border-b-gray-200"
    />
  );
}
