import type { Currency } from "@/lib/currency";

export type OrderStatus =
  | "pending_payment"
  | "pending_verification"
  | "paid"
  | "failed"
  | "cancelled";

export type PreferredLanguage = "EN" | "TH";

export type OrderItem = {
  itemId: string;
  categorySlug: string;
  name: string;
  unitPriceThb: number;
  unitPriceUsd: number | null;
  qty: number;
};

export type OrderCustomer = {
  name: string;
  company: string | null;
  email: string;
  phone: string;
  preferredLanguage: PreferredLanguage;
};

export type Order = {
  id: string;
  createdAt: string;
  customer: OrderCustomer;
  items: OrderItem[];
  totalThb: number;
  // The currency actually charged - null totalUsd means this order predates
  // USD checkout (or one of its items had no USD price at order time).
  currency: Currency;
  totalUsd: number | null;
  status: OrderStatus;
  paymentProvider: string;
};

export type NewOrderInput = {
  customer: OrderCustomer;
  items: OrderItem[];
  totalThb: number;
  currency: Currency;
  totalUsd: number | null;
  paymentProvider: string;
};

/**
 * Storage for orders and their line items. The SQLite implementation
 * (sqlite-store.ts) unblocks local development and small-scale launch
 * without a new external account. Before real transaction volume, swap in
 * a networked store (Supabase/Postgres is the documented recommendation)
 * by implementing this same interface — nothing else in the app changes.
 */
export interface OrderStore {
  create(input: NewOrderInput): Promise<Order>;
  get(id: string): Promise<Order | null>;
  updateStatus(id: string, status: OrderStatus): Promise<Order>;
}
