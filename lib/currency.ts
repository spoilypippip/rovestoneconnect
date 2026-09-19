export type Currency = "THB" | "USD" | "EUR";

// Last-resort EUR-per-1-USD rate, used only when both the live rate (see
// lib/exchange-rate.ts) and any previously cached rate are unavailable
// (e.g. first deploy against a fresh Supabase project, or a total outage).
export const PLACEHOLDER_EUR_PER_USD = 0.87;

// EUR is derived from the fixed, business-approved USD price (data/catalog.json)
// times a live USD->EUR market rate - never from THB directly. This keeps
// the USD and EUR prices shown for the same item always consistent with the
// real EUR/USD market rate, which a THB->EUR-direct conversion couldn't
// guarantee (USD prices are a static spreadsheet snapshot, so an
// independently-computed THB->EUR live rate could drift away from the
// implied USD/EUR cross rate over time).
export function usdToEur(usd: number, eurPerUsd: number = PLACEHOLDER_EUR_PER_USD): number {
  return Math.round(usd * eurPerUsd * 100) / 100;
}

export function formatMoney(amount: number, currency: Currency): string {
  if (currency === "USD") {
    return `$${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (currency === "EUR") {
    return `€${amount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `฿${amount.toLocaleString("en-US")}`;
}

// For amounts tied to an order: the currency actually charged, not a
// display preference - `usd`/`eur` are only used when the order's currency
// matches (and only if present; orders placed before that currency existed
// have none).
export function formatCharged(
  currency: Currency,
  thb: number,
  usd: number | null,
  eur: number | null,
): string {
  if (currency === "USD" && usd != null) return formatMoney(usd, "USD");
  if (currency === "EUR" && eur != null) return formatMoney(eur, "EUR");
  return formatMoney(thb, "THB");
}
