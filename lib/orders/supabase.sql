-- Run this once in the Supabase SQL editor before setting SUPABASE_URL /
-- SUPABASE_SERVICE_ROLE_KEY. Matches lib/orders/supabase-store.ts.
--
-- The app only ever talks to these tables via the service-role key from
-- server code (Server Actions / Server Components), never from the
-- browser. Row Level Security is enabled on both tables in the Supabase
-- project with no policies attached, which is the correct setup for that:
-- the service-role key bypasses RLS, so the server keeps working, while
-- the anon/publishable key (which does not bypass it) can read nothing.
-- If you later add a customer-facing "my orders" page that queries from
-- the browser with the anon key, it will return zero rows until you add
-- select policies scoping orders to the signed-in customer - add those
-- first, don't disable RLS.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_company text,
  customer_email text not null,
  customer_phone text not null,
  preferred_language text not null check (preferred_language in ('EN', 'TH')),
  total_thb integer not null,
  currency text not null default 'THB' check (currency in ('THB', 'USD')),
  total_usd numeric,
  status text not null default 'pending_payment'
    check (status in ('pending_payment', 'pending_verification', 'paid', 'failed', 'cancelled')),
  payment_provider text not null
);

create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id uuid not null references orders(id) on delete cascade,
  item_id text not null,
  category_slug text not null,
  name text not null,
  unit_price_thb integer not null,
  unit_price_usd numeric,
  qty integer not null
);

create index if not exists order_items_order_id_idx on order_items (order_id);

-- Adds real USD checkout (Stripe can charge USD directly, not just show an
-- equivalent). Safe to re-run on a database that already has the tables
-- above from before this - each statement is a no-op if already applied.
alter table orders add column if not exists currency text not null default 'THB' check (currency in ('THB', 'USD'));
alter table orders add column if not exists total_usd numeric;
alter table order_items add column if not exists unit_price_usd numeric;

-- Adds real EUR checkout alongside USD. EUR has no stored per-item catalog
-- price - it's derived from the THB price via a placeholder conversion
-- rate (see PLACEHOLDER_THB_PER_EUR in lib/currency.ts) at order-creation
-- time, then frozen here like unit_price_usd/total_usd already are.
-- `add column if not exists` is a no-op if this has already been run, but
-- the currency CHECK constraint needs a real drop+recreate to widen since
-- the column already exists on this table.
alter table orders add column if not exists total_eur numeric;
alter table order_items add column if not exists unit_price_eur numeric;
alter table orders drop constraint if exists orders_currency_check;
alter table orders add constraint orders_currency_check check (currency in ('THB', 'USD', 'EUR'));
