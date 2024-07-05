import { usePathname } from "next/navigation";
import { useCallback } from "react";


export function useIsOnPathname() {
  const pathname = usePathname();

  const isOnPathname = useCallback(
    (href?: string) => {
      if (!href) return false
      return pathname.endsWith(href);
    },
    [pathname]
  );

  return isOnPathname
}
