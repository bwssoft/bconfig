import { IUser, TestMetadata } from "@/app/lib/definition";
import { cn } from "@/app/lib/util";
import { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { Button } from "../../components/button";
import { DocumentMagnifyingGlassIcon } from "@heroicons/react/24/outline";

const statuses = {
  success: "text-green-500 bg-green-800/20",
  fail: "text-rose-500 bg-rose-800/20",
};

const text = {
  success: "text-green-800",
  fail: "text-rose-800",
};

export const columns: ColumnDef<{
  id: string;
  imei: string;
  is_successful: boolean;
  created_at: Date;
  metadata: TestMetadata;
  user: IUser;
}>[] = [
  {
    header: "Status",
    accessorKey: "is_successful",
    cell: ({ row }) => {
      const device = row.original;
      const status = device.is_successful ? "success" : "fail";
      const label = device.is_successful ? "Success" : "Failed";
      return (
        <div className="flex items-center gap-1">
          <div className={cn(statuses[status], "flex-none rounded-full p-1")}>
            <div className="h-1.5 w-1.5 rounded-full bg-current" />
          </div>
          <div className={cn("hidden font-semibold sm:block", text[status])}>
            {label}
          </div>
        </div>
      );
    },
  },
  { header: "Serial Number", accessorKey: "imei" },
  {
    header: "Duration Time",
    accessorKey: "metadata",
    cell: ({ row }) => {
      const device = row.original;
      const end = device.metadata.end_time_configuration;
      const init = device.metadata.init_time_configuration;
      return `${(end - init) / 1000} s`;
    },
  },
  { header: "User", accessorKey: "user.name" },
  {
    header: "Created At",
    accessorKey: "created_at",
    cell: ({ row }) => {
      const device = row.original;
      return device.created_at.toLocaleString();
    },
  },
  {
    header: "Ações",
    accessorKey: "port",
    cell: ({ row }) => {
      const log = row.original;
      return (
        <div className="flex gap-2">
          <Link href={`/auto-test/E3+4G/review?id=${log.id}`} target="_blank">
            <Button
              variant="outlined"
              className="p-2"
              title="Verificar logs do auto teste"
            >
              <DocumentMagnifyingGlassIcon
                width={16}
                height={16}
                title="Verificar logs do auto teste"
              />
            </Button>
          </Link>
        </div>
      );
    },
  },
];
