import { createClient } from "@supabase/supabase-js";
import type { NewOrderInput, Order, OrderItem, OrderStatus, OrderStore } from "./types";

function getClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set to use SupabaseOrderStore.");
  }
  // Service-role key: this store is only ever called from server code
  // (Server Actions, Server Components), never sent to the browser.
  return createClient(url, key, { auth: { persistSession: false } });
}

type OrderRow = {
  id: string;
  created_at: string;
  customer_name: string;
  customer_company: string | null;
  customer_email: string;
  customer_phone: string;
  preferred_language: Order["customer"]["preferredLanguage"];
  total_thb: number;
  status: OrderStatus;
  payment_provider: string;
};

type OrderItemRow = {
  item_id: string;
  category_slug: string;
  name: string;
  unit_price_thb: number;
  qty: number;
};

function toOrder(row: OrderRow, items: OrderItem[]): Order {
  return {
    id: row.id,
    createdAt: row.created_at,
    customer: {
      name: row.customer_name,
      company: row.customer_company,
      email: row.customer_email,
      phone: row.customer_phone,
      preferredLanguage: row.preferred_language,
    },
    items,
    totalThb: row.total_thb,
    status: row.status,
    paymentProvider: row.payment_provider,
  };
}

function toOrderItems(rows: OrderItemRow[]): OrderItem[] {
  return rows.map((r) => ({
    itemId: r.item_id,
    categorySlug: r.category_slug,
    name: r.name,
    unitPriceThb: r.unit_price_thb,
    qty: r.qty,
  }));
}

/**
 * Networked order store for production (Vercel or any serverless host).
 * See supabase.sql for the schema this expects. Requires SUPABASE_URL and
 * SUPABASE_SERVICE_ROLE_KEY.
 */
export class SupabaseOrderStore implements OrderStore {
  async create(input: NewOrderInput): Promise<Order> {
    const client = getClient();

    const { data: orderRow, error } = await client
      .from("orders")
      .insert({
        customer_name: input.customer.name,
        customer_company: input.customer.company,
        customer_email: input.customer.email,
        customer_phone: input.customer.phone,
        preferred_language: input.customer.preferredLanguage,
        total_thb: input.totalThb,
        status: "pending_payment",
        payment_provider: input.paymentProvider,
      })
      .select()
      .single();

    if (error || !orderRow) {
      throw new Error(`Failed to create order: ${error?.message ?? "unknown error"}`);
    }

    const { error: itemsError } = await client.from("order_items").insert(
      input.items.map((item) => ({
        order_id: orderRow.id,
        item_id: item.itemId,
        category_slug: item.categorySlug,
        name: item.name,
        unit_price_thb: item.unitPriceThb,
        qty: item.qty,
      })),
    );

    if (itemsError) {
      throw new Error(`Failed to create order items: ${itemsError.message}`);
    }

    return toOrder(orderRow as OrderRow, input.items);
  }

  async get(id: string): Promise<Order | null> {
    const client = getClient();

    const { data: orderRow, error } = await client.from("orders").select().eq("id", id).maybeSingle();
    if (error) throw new Error(`Failed to fetch order: ${error.message}`);
    if (!orderRow) return null;

    const { data: itemRows, error: itemsError } = await client
      .from("order_items")
      .select()
      .eq("order_id", id);
    if (itemsError) throw new Error(`Failed to fetch order items: ${itemsError.message}`);

    return toOrder(orderRow as OrderRow, toOrderItems((itemRows ?? []) as OrderItemRow[]));
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    const client = getClient();

    const { error } = await client.from("orders").update({ status }).eq("id", id);
    if (error) throw new Error(`Failed to update order status: ${error.message}`);

    const order = await this.get(id);
    if (!order) throw new Error(`Order not found: ${id}`);
    return order;
  }
}
