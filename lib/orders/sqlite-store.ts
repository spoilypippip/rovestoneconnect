// Local-dev / single-instance fallback ONLY. Do not use this on Vercel or
// any serverless host: the filesystem there is ephemeral and not shared
// across invocations, so an order written by one request may not exist
// when the next request reads it. Set SUPABASE_URL and
// SUPABASE_SERVICE_ROLE_KEY (see supabase.sql) to use SupabaseOrderStore
// instead - lib/orders/index.ts picks it automatically when those are set,
// and this module is never even imported in that case.
import { DatabaseSync } from "node:sqlite";
import { randomUUID } from "node:crypto";
import { mkdirSync } from "node:fs";
import path from "node:path";
import type { NewOrderInput, Order, OrderStatus, OrderStore } from "./types";

const DB_DIR = path.join(process.cwd(), "var");
const DB_PATH = path.join(DB_DIR, "orders.db");

let db: DatabaseSync | undefined;

function getDb(): DatabaseSync {
  if (db) return db;
  mkdirSync(DB_DIR, { recursive: true });
  db = new DatabaseSync(DB_PATH);
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id TEXT PRIMARY KEY,
      created_at TEXT NOT NULL,
      customer_name TEXT NOT NULL,
      customer_company TEXT,
      customer_email TEXT NOT NULL,
      customer_phone TEXT NOT NULL,
      preferred_language TEXT NOT NULL,
      items_json TEXT NOT NULL,
      total_thb INTEGER NOT NULL,
      status TEXT NOT NULL,
      payment_provider TEXT NOT NULL
    )
  `);
  return db;
}

function rowToOrder(row: Record<string, unknown>): Order {
  return {
    id: row.id as string,
    createdAt: row.created_at as string,
    customer: {
      name: row.customer_name as string,
      company: (row.customer_company as string | null) ?? null,
      email: row.customer_email as string,
      phone: row.customer_phone as string,
      preferredLanguage: row.preferred_language as Order["customer"]["preferredLanguage"],
    },
    items: JSON.parse(row.items_json as string),
    totalThb: row.total_thb as number,
    status: row.status as OrderStatus,
    paymentProvider: row.payment_provider as string,
  };
}

export class SqliteOrderStore implements OrderStore {
  async create(input: NewOrderInput): Promise<Order> {
    const order: Order = {
      id: randomUUID(),
      createdAt: new Date().toISOString(),
      customer: input.customer,
      items: input.items,
      totalThb: input.totalThb,
      status: "pending_payment",
      paymentProvider: input.paymentProvider,
    };

    getDb()
      .prepare(
        `INSERT INTO orders
          (id, created_at, customer_name, customer_company, customer_email, customer_phone, preferred_language, items_json, total_thb, status, payment_provider)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        order.id,
        order.createdAt,
        order.customer.name,
        order.customer.company,
        order.customer.email,
        order.customer.phone,
        order.customer.preferredLanguage,
        JSON.stringify(order.items),
        order.totalThb,
        order.status,
        order.paymentProvider,
      );

    return order;
  }

  async get(id: string): Promise<Order | null> {
    const row = getDb().prepare(`SELECT * FROM orders WHERE id = ?`).get(id);
    return row ? rowToOrder(row as Record<string, unknown>) : null;
  }

  async updateStatus(id: string, status: OrderStatus): Promise<Order> {
    getDb().prepare(`UPDATE orders SET status = ? WHERE id = ?`).run(status, id);
    const order = await this.get(id);
    if (!order) throw new Error(`Order not found: ${id}`);
    return order;
  }
}
