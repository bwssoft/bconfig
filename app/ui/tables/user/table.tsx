"use client";

import { columns } from "./columns";
import { DataTable } from "../../components/data-table";

interface Props {
  data: { id: string; name: string; email: string, type: "employee" | "external" | "client" }[];
}
export default function UserTable(props: Props) {
  const { data } = props;
  return (
    <DataTable
      columns={columns}
      data={data}
      mobileDisplayValue={(data) => data.name}
      mobileKeyExtractor={() => Math.random().toString()}
      className="w-full mt-10"
      theadClassName="[&_tr]:border-b bg-white border-b-1 border-b-gray-200"
    />
  );
}
