"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import { formatMoney } from "@/lib/currency";

// `usd` is null when no USD figure is available for this amount (e.g. an
// item removed from the catalog since the order was placed) - in that case
// THB is shown regardless of the selected currency.
export default function Amount({ thb, usd }: { thb: number; usd: number | null }) {
  const { currency } = useCurrency();
  return <>{currency === "USD" && usd != null ? formatMoney(usd, "USD") : formatMoney(thb, "THB")}</>;
}
