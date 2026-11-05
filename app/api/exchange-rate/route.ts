import { NextResponse } from "next/server";
import { getEurPerUsdRate } from "@/lib/exchange-rate";

// Read by CurrencyProvider once on mount so browsing-time EUR prices
// (components/Amount.tsx) use the cached/live rate instead of always
// falling back to PLACEHOLDER_EUR_PER_USD. Checkout does NOT call this -
// it resolves its own rate server-side once per order (see
// app/checkout/actions.ts) so the charged price is frozen independently of
// whatever the browser happened to have cached for display.
export async function GET() {
  const eurPerUsd = await getEurPerUsdRate();
  return NextResponse.json({ eurPerUsd });
}
