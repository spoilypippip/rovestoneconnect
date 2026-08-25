import type { OrderStore } from "./types";

let cached: Promise<OrderStore> | null = null;

async function createStore(): Promise<OrderStore> {
  if (process.env.SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const { SupabaseOrderStore } = await import("./supabase-store");
    return new SupabaseOrderStore();
  }

  // Local development / single-instance fallback only (see sqlite-store.ts
  // for why this isn't safe on serverless hosts like Vercel). Imported
  // lazily so `node:sqlite` never loads at all once Supabase is
  // configured.
  const { SqliteOrderStore } = await import("./sqlite-store");
  return new SqliteOrderStore();
}

export function getOrderStore(): Promise<OrderStore> {
  if (!cached) cached = createStore();
  return cached;
}

export type { Order, OrderCustomer, OrderItem, OrderStatus, OrderStore, NewOrderInput } from "./types";
