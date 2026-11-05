import { createClient } from "@supabase/supabase-js";
import { PLACEHOLDER_EUR_PER_USD } from "./currency";

const CURRENCY_PAIR = "USD_EUR";
const REFRESH_INTERVAL_MS = 4 * 60 * 60 * 1000; // 4 hours - see notes below.
const FRANKFURTER_URL = "https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR";

// Margin added on top of the raw market rate before it's used for pricing -
// protects against the rate moving against the business during the window
// before the cache refreshes. Expressed as an EUR-per-USD *increase*, which
// makes usdToEur() (usd * rate) resolve to slightly MORE EUR per USD price -
// i.e. the customer is quoted a touch worse than mid-market, same direction
// real payment processors bias their FX margin. Kept at the same 1.5%
// originally used for the THB->EUR rate this replaced - EUR/USD is a far
// more liquid, less volatile pair than THB crosses, so this is arguably
// more buffer than a 4-hour window needs, but there's no measured
// volatility data yet to justify a different number. Tune independently -
// this constant only affects USD->EUR.
const USD_EUR_RATE_BUFFER_PERCENT = 1.5;

// Same reasoning as lib/orders/supabase-store.ts: this is only ever called
// from server code with the service-role key, never sent to the browser.
function getServiceClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

async function readCachedRate(): Promise<{ rate: number; fetchedAt: string } | null> {
  const client = getServiceClient();
  if (!client) return null;

  const { data, error } = await client
    .from("exchange_rates")
    .select("rate, fetched_at")
    .eq("currency_pair", CURRENCY_PAIR)
    .maybeSingle();

  if (error || !data) return null;
  return { rate: Number(data.rate), fetchedAt: data.fetched_at as string };
}

async function writeCachedRate(rate: number): Promise<void> {
  const client = getServiceClient();
  if (!client) return;

  const { error } = await client
    .from("exchange_rates")
    .upsert({ currency_pair: CURRENCY_PAIR, rate, fetched_at: new Date().toISOString() });

  if (error) {
    console.error(`[exchange-rate] Failed to cache USD/EUR rate in Supabase: ${error.message}`);
  }
}

async function fetchLiveRate(): Promise<number | null> {
  try {
    const res = await fetch(FRANKFURTER_URL, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) throw new Error(`frankfurter.dev responded ${res.status}`);

    const body = (await res.json()) as { rates?: Record<string, number> };
    const eurPerUsd = body.rates?.EUR;
    if (!eurPerUsd || eurPerUsd <= 0) throw new Error("Malformed frankfurter.dev response");

    // base=USD&symbols=EUR already returns EUR per 1 USD directly - no
    // inversion needed (unlike the old THB-based rate, which had to invert
    // frankfurter's THB-per-1-EUR response).
    return eurPerUsd;
  } catch (err) {
    console.warn(`[exchange-rate] Live USD/EUR fetch failed: ${(err as Error).message}`);
    return null;
  }
}

/**
 * EUR-per-1-USD rate, with USD_EUR_RATE_BUFFER_PERCENT margin applied,
 * refreshed from frankfurter.dev at most once per REFRESH_INTERVAL_MS (a
 * Supabase row is the durable cache - this only calls the API when that row
 * is missing or stale, never on every request). Never throws - always
 * resolves to a usable number:
 *
 *   fresh API call -> last cached row (however stale) -> PLACEHOLDER_EUR_PER_USD
 *
 * Call this once per checkout and reuse the result for every line item in
 * that order - never call it again for the same order afterward (the
 * confirmation page and notifications must read the price that was frozen
 * onto the order at creation time, not recompute it).
 */
export async function getEurPerUsdRate(): Promise<number> {
  const cached = await readCachedRate();
  const isStale = !cached || Date.now() - new Date(cached.fetchedAt).getTime() > REFRESH_INTERVAL_MS;

  let rawRate = cached?.rate ?? null;

  if (isStale) {
    const live = await fetchLiveRate();
    if (live != null) {
      rawRate = live;
      await writeCachedRate(live);
      console.log(
        `[exchange-rate] Refreshed USD/EUR from frankfurter.dev: 1 USD = ${live.toFixed(4)} EUR at ${new Date().toISOString()}`,
      );
    } else if (cached) {
      console.warn(
        `[exchange-rate] Live fetch failed - using cached USD/EUR rate from ${cached.fetchedAt}: 1 USD = ${cached.rate} EUR`,
      );
    }
  }

  if (rawRate == null) {
    console.warn(
      `[exchange-rate] No live or cached USD/EUR rate available - using emergency fallback: 1 USD = ${PLACEHOLDER_EUR_PER_USD} EUR`,
    );
    rawRate = PLACEHOLDER_EUR_PER_USD;
  }

  const effectiveRate = rawRate * (1 + USD_EUR_RATE_BUFFER_PERCENT / 100);
  console.log(
    `[exchange-rate] Using USD/EUR rate ${effectiveRate.toFixed(4)} (raw ${rawRate.toFixed(4)} + ${USD_EUR_RATE_BUFFER_PERCENT}% margin)`,
  );
  return effectiveRate;
}
