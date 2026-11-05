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

export type ContactMessageDetails = {
  name: string;
  company: string | null;
  email: string;
  phone: string | null;
  serviceSlug: string | null;
  serviceName: string | null;
  message: string;
};

/**
 * Whether the alert actually went out. Callers that front a form must not
 * tell the customer "thank you" on anything but `ok: true` - an alert
 * nobody receives is the same as the message never being sent.
 */
export type NotificationResult =
  | { ok: true }
  | { ok: false; reason: "not-configured" | "delivery-failed" };

/**
 * Internal "a human needs to follow up" alert. LINE Notify is dead (shut
 * down March 31, 2025) — this is deliberately provider-agnostic so the
 * default (email) can ship now and LINE Messaging API can be enabled
 * later purely via env vars, with no code changes at the call sites.
 */
export interface NotificationProvider {
  notifyNewOrder(order: Order): Promise<NotificationResult>;
  notifyQuoteRequest(details: QuoteRequestDetails): Promise<NotificationResult>;
  notifyContactMessage(details: ContactMessageDetails): Promise<NotificationResult>;
}
