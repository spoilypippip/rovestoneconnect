export type Currency = "THB" | "USD";

export function formatMoney(amount: number, currency: Currency): string {
  return currency === "USD"
    ? `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    : `฿${amount.toLocaleString("en-US")}`;
}
