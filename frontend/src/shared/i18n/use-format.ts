"use client";

import { useMemo } from "react";
import { dateParts, formatDateTime, formatNumber, formatPrice } from "@/shared/lib/format";
import { useLocale } from "./use-t";

/** Date / price / number formatting in the current language. */
export function useFormat() {
  const locale = useLocale();
  return useMemo(
    () => ({
      locale,
      dateTime: (iso: string) => formatDateTime(iso, locale),
      dateParts: (iso: string) => dateParts(iso, locale),
      price: (n: number) => formatPrice(n, locale),
      number: (n: number) => formatNumber(n, locale),
    }),
    [locale],
  );
}
