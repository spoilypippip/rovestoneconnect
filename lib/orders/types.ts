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
  status: OrderStatus;
  paymentProvider: string;
};

export type NewOrderInput = {
  customer: OrderCustomer;
  items: OrderItem[];
  totalThb: number;
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
