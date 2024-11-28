import { formatSearchParams } from "@/app/lib/util/format-search-params";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { exportConfigurationLog } from "@/app/lib/action";
import * as XLSX from 'xlsx'
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";

const schema = z.object({
  is_configured: z.string().optional(),
  query: z.string().optional(),
  date: z.object({
    from: z.string().optional(),
    to: z.string().optional(),
  }).optional(),
  page: z.string().optional(),
})

export type Schema = z.infer<typeof schema>;

export function useSearchConfigurationLogForm() {
  const {
    register,
    handleSubmit: hookFormSubmit,
    control,
    setValue,
    reset,
  } = useForm<Schema>({
    resolver: zodResolver(schema),
  });
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const [modalIsOpen, setModalIsOpen] = useState(false)

  const handleSubmit = hookFormSubmit(async (data) => {
    try {
      const { date, ...query } = data
      const params = {
        ...query,
        to: date?.to,
        from: date?.from,
      }
      handleChangeQueryParams(params)
      setModalIsOpen(false)
    } catch (e) {
      console.error(e)
    }
  })


  const parseSearchParams = (searchParams: URLSearchParams) => {
    const params: {
      is_configured?: boolean;
      query?: string;
      from?: Date;
      to?: Date;
    } = {};

    searchParams.forEach((value, key) => {
      if (value) {
        if (key === "to" || key === "from") {
          params[key] = new Date(value);
        }
        if (key === "is_configured") {
          params[key] = value === "true" ? true : false
        }
        if (key === 'query') {
          params[key] = value
        }
      }
    });

    return {
      is_configured: params.is_configured,
      query: params.query,
      from: params.from,
      to: params.to,
    };
  }
  const handleExport = async () => {
    const workbook = await exportConfigurationLog(parseSearchParams(searchParams))
    XLSX.writeFile(workbook, `${new Date().toLocaleDateString()}-LOG-CONFIG.xlsx`);
  }
  const handleChangeQueryParams = (data: Schema) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams(data, old_params);
    router.push(`${pathname}?${params}`)
  }
  const handleOpenModal = (isOpen: boolean) => {
    setModalIsOpen(isOpen)
  }

  return {
    searchParams,
    pathname,
    router,
    handleExport,
    handleSubmit,
    handleChangeQueryParams,
    register,
    modalIsOpen,
    setValue,
    reset,
    control,
    handleOpenModal
  };
}
