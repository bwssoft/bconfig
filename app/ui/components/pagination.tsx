"use client";

import { formatSearchParams } from "@/app/lib/util/format-search-params";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

interface Props {
  total: number;
}

export type { Props as IPaginationProps };

export function Pagination(props: Props) {
  const { total } = props;

  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const page = Number(searchParams.get("page")) ?? 1;

  const handleChangeSearchParams = (input: { page: number }) => {
    const old_params = new URLSearchParams(searchParams);
    const params = formatSearchParams(input, old_params);
    router.push(`${pathname}?${params}`);
  };

  const forward = () => {
    let index = page + 1;
    if (index > total) index = 1;
    handleChangeSearchParams({ page: index });
  };

  const previous = () => {
    let index = page - 1;
    if (index <= 0) index = 1;
    handleChangeSearchParams({ page: index });
  };

  return (
    <nav
      aria-label="Pagination"
      className="w-full flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6"
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700">
          Apresentando pagina <span className="font-medium">{page}</span> de{" "}
          <span className="font-medium">{total}</span>. <span className="font-medium">20</span>{" "}
          itens por pagina.
        </p>
      </div>
      <div className="flex flex-1 justify-between sm:justify-end">
        <button
          disabled={!(page > 1)}
          onClick={previous}
          className="relative disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-default inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
        >
          Anterior
        </button>

        <button
          disabled={page === total}
          onClick={forward}
          className="relative disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-default ml-3 inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus-visible:outline-offset-0"
        >
          Próximo
        </button>
      </div>
    </nav>
  );
}
