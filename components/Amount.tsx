"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { formatMoney, usdToEur } from "@/lib/currency";

// `usd` is null when no USD figure is available for this amount (e.g. an
// item removed from the catalog since the order was placed) - in that case
// THB is shown regardless of the selected currency. EUR is derived from
// `usd` (the fixed, business-approved price) times a live market rate, so
// it has the exact same null-falls-back-to-THB behavior as USD.
export default function Amount({ thb, usd }: { thb: number; usd: number | null }) {
  const { currency, eurPerUsd } = useCurrency();
  if (currency === "USD" && usd != null) return <>{formatMoney(usd, "USD")}</>;
  if (currency === "EUR" && usd != null) return <>{formatMoney(usdToEur(usd, eurPerUsd), "EUR")}</>;
  return <>{formatMoney(thb, "THB")}</>;
}
