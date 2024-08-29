"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  getPaginationRowModel,
} from "@tanstack/react-table";
import { ComponentProps, ReactNode } from "react";
import { useMediaQuery } from "@/app/hook/use-media-query";
import { cn } from "@/app/lib/util";

interface DataTableDesktopProps<TData, TValue> extends ComponentProps<"div"> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  onRowPress?(data: TData): void;
  tdClassName?: string;
  thClassName?: string;
  theadClassName?: string;
}

export function DataTableDesktop<TData, TValue>({
  columns,
  data,
  onRowPress = undefined,
  className,
  tdClassName,
  thClassName,
  theadClassName,
  ...rest
}: DataTableDesktopProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    manualPagination: true,
  });

  delete (rest as any).mobileKeyExtractor;
  delete (rest as any).mobileDisplayValue;
  return (
    <div
      {...rest}
      className={cn("flex flex-col h-full rounded-md bg-white", className)}
    >
      <div className="flex-grow overflow-auto max-h-[400px]">
        <table className="w-full caption-bottom text-sm">
          <thead className={cn(theadClassName)}>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <th
                      key={header.id}
                      className={cn(
                        "px-6 py-3 text-left text-sm font-semibold text-gray-900",
                        thClassName
                      )}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </th>
                  );
                })}
              </tr>
            ))}
          </thead>
          <tbody className="[&_tr:last-child]:border-0 divide-y divide-gray-200 bg-white">
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className={`${
                    onRowPress !== undefined &&
                    "border-b transition-colors hover:bg-gray-100 cursor-pointer"
                  }`}
                  onClick={() => onRowPress && onRowPress(row.original)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={cn(
                        "whitespace-nowrap align-middle px-6 py-4 text-sm text-gray-500",
                        tdClassName
                      )}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="h-24 text-center">
                  Nenhum resultado encontrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface DataTableMobileProps<TData> {
  data: TData[];
  mobileKeyExtractor(data: TData): string;
  mobileDisplayValue(data: TData): string | ReactNode;
  onRowPress?(data: TData): void;
}

export function DataTableMobile<TData>({
  data,
  mobileKeyExtractor,
  mobileDisplayValue,
  onRowPress,
}: DataTableMobileProps<TData>) {
  return (
    <ul
      role="list"
      className="mt-2 rounded-t-lg divide-y divide-gray-200 overflow-hidden shadow sm:hidden"
    >
      {data.map((row) => (
        <li
          key={mobileKeyExtractor(row)}
          onClick={() => onRowPress && onRowPress(row)}
          className="flex justify-between items-center px-3 py-4 bg-white text-sm"
        >
          {mobileDisplayValue(row)}
          {/* <ChevronRightIcon
            className="h-5 w-5 flex-shrink-0 text-gray-400"
            aria-hidden="true"
          /> */}
        </li>
      ))}
    </ul>
  );
}

type DataTableProps<TData, TValue> = DataTableDesktopProps<TData, TValue> &
  DataTableMobileProps<TData>;

export function DataTable<TData, TValue>(props: DataTableProps<TData, TValue>) {
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return <DataTableDesktop {...props} />;
  }

  return <DataTableMobile {...props} />;
}
