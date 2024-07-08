"use client";
//tava reclamando da função cell nas colunas

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";

interface Props {
  data: {
    init_time_command: number;
    end_time_command?: number;
    request: string;
    response?: string;
  }[];
}
export default function CommandLogTable(props: Props) {
  const { data } = props;
  return (
    <DataTable
      columns={columns}
      data={data}
      mobileDisplayValue={(data) => `${data.request} ${data.response ?? "--"}`}
      mobileKeyExtractor={() => Math.random().toString()}
      className="w-full"
      theadClassName="[&_tr]:border-b bg-white border-b-1 border-b-gray-200"
    />
  );
}
