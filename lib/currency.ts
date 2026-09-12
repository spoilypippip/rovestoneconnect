export type Currency = "THB" | "USD";

export function formatMoney(amount: number, currency: Currency): string {
  return currency === "USD"
    ? `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `฿${amount.toLocaleString("en-US")}`;
}

// For amounts tied to an order: the currency actually charged, not a
// display preference - `usd` is only used when the order's currency is USD
// (and only if present; orders placed before USD checkout existed have none).
export function formatCharged(currency: Currency, thb: number, usd: number | null): string {
  return currency === "USD" && usd != null ? formatMoney(usd, "USD") : formatMoney(thb, "THB");
}
