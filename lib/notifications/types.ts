import type { Order } from "@/lib/orders/types";

export type QuoteRequestDetails = {
  itemId: string | null;
  itemName: string | null;
  name: string;
  company: string | null;
  email: string;
  phone: string;
  message: string;
};

/**
 * Internal "a human needs to follow up" alert. LINE Notify is dead (shut
 * down March 31, 2025) — this is deliberately provider-agnostic so the
 * default (email) can ship now and LINE Messaging API can be enabled
 * later purely via env vars, with no code changes at the call sites.
 */
export interface NotificationProvider {
  notifyNewOrder(order: Order): Promise<void>;
  notifyQuoteRequest(details: QuoteRequestDetails): Promise<void>;
}
