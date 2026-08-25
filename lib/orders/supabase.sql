-- Run this once in the Supabase SQL editor before setting SUPABASE_URL /
-- SUPABASE_SERVICE_ROLE_KEY. Matches lib/orders/supabase-store.ts.
--
-- The app only ever talks to these tables via the service-role key from
-- server code (Server Actions / Server Components), never from the
-- browser, so Row Level Security is left off by default. If you later
-- add a customer-facing "my orders" page using the anon key from the
-- browser, enable RLS and add policies before doing that.

create table if not exists orders (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  customer_name text not null,
  customer_company text,
  customer_email text not null,
  customer_phone text not null,
  preferred_language text not null check (preferred_language in ('EN', 'TH')),
  total_thb integer not null,
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
  qty integer not null
);

create index if not exists order_items_order_id_idx on order_items (order_id);
