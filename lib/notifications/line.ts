import type { Order } from "@/lib/orders/types";
import type {
  ContactMessageDetails,
  NotificationProvider,
  NotificationResult,
  QuoteRequestDetails,
} from "./types";
import { formatCharged } from "@/lib/currency";

// What kind of alert a log line is about. Safe to log anywhere: it says
// nothing about the person the alert concerns.
type NotificationKind = "new-order" | "quote-request" | "contact-message";

/**
 * The push text carries the customer's name and phone number, so in
 * production it stays out of the server log (see email.ts for the same
 * reasoning). Locally the full text is the useful part, since nothing is
 * being delivered.
 */
function reportUnconfigured(kind: NotificationKind, ref: string, text: string) {
  const missing = "LINE_CHANNEL_ACCESS_TOKEN/LINE_TARGET_ID";

  if (process.env.NODE_ENV === "production") {
    console.error(
      `[notifications] LINE not configured (missing ${missing}). Dropped ${kind} ${ref} unsent; contents withheld because they contain personal data.`,
    );
    return;
  }

  console.warn(
    `[notifications] LINE not configured (missing ${missing}). Would have pushed ${kind} ${ref}:\n${text}`,
  );
}

// TODO: set LINE_CHANNEL_ACCESS_TOKEN and LINE_TARGET_ID (a user or group
// id from the LINE Official Account Manager) before enabling this
// provider. Uses the LINE Messaging API push endpoint — LINE Notify was
// discontinued March 31, 2025 and no longer works.
async function push(kind: NotificationKind, ref: string, text: string): Promise<NotificationResult> {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TARGET_ID;

  if (!token || !to) {
    reportUnconfigured(kind, ref, text);
    return { ok: false, reason: "not-configured" };
  }

  let res: Response;
  try {
    res = await fetch("https://api.line.me/v2/bot/message/push", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
    });
  } catch (error) {
    console.error(`[notifications] LINE push for ${kind} ${ref} failed: ${(error as Error).message}`);
    return { ok: false, reason: "delivery-failed" };
  }

  if (!res.ok) {
    console.error(
      `[notifications] LINE push for ${kind} ${ref} failed: ${res.status} ${await res.text()}`,
    );
    return { ok: false, reason: "delivery-failed" };
  }

  return { ok: true };
}

export class LineNotificationProvider implements NotificationProvider {
  async notifyNewOrder(order: Order): Promise<NotificationResult> {
    const itemNames = order.items.map((item) => `${item.name} x${item.qty}`).join(", ");
    return push(
      "new-order",
      order.id,
      `New order: ${order.id}\nStatus: ${order.status}\nCustomer: ${order.customer.name} (${order.customer.phone})\nTotal: ${formatCharged(order.currency, order.totalThb, order.totalUsd, order.totalEur)}\nItems: ${itemNames}`,
    );
  }

  async notifyQuoteRequest(details: QuoteRequestDetails): Promise<NotificationResult> {
    return push(
      "quote-request",
      crypto.randomUUID(),
      `New quote request${details.itemName ? `: ${details.itemName}` : ""}\nFrom: ${details.name} (${details.phone})\n${details.message}`,
    );
  }

  async notifyContactMessage(details: ContactMessageDetails): Promise<NotificationResult> {
    return push(
      "contact-message",
      crypto.randomUUID(),
      `New consultation request${details.serviceName ? `: ${details.serviceName}` : ""}\nFrom: ${details.name} <${details.email}>${details.phone ? ` (${details.phone})` : ""}\n${details.message}`,
    );
  }
}
