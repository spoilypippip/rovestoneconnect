-- Run this once in the Supabase SQL editor. Matches lib/exchange-rate.ts.
--
-- One row per currency pair, upserted by the server (service-role key) -
-- never written from the browser, so RLS is left off, same reasoning as
-- lib/orders/supabase.sql.

create table if not exists exchange_rates (
  currency_pair text primary key,
  rate numeric not null,
  fetched_at timestamptz not null default now()
);
