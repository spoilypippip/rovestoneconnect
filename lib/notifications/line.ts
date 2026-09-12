import type { Order } from "@/lib/orders/types";
import type { NotificationProvider, QuoteRequestDetails } from "./types";
import { formatCharged } from "@/lib/currency";

// TODO: set LINE_CHANNEL_ACCESS_TOKEN and LINE_TARGET_ID (a user or group
// id from the LINE Official Account Manager) before enabling this
// provider. Uses the LINE Messaging API push endpoint — LINE Notify was
// discontinued March 31, 2025 and no longer works.
async function push(text: string) {
  const token = process.env.LINE_CHANNEL_ACCESS_TOKEN;
  const to = process.env.LINE_TARGET_ID;

  if (!token || !to) {
    console.warn(
      `[notifications] LINE not configured (missing LINE_CHANNEL_ACCESS_TOKEN/LINE_TARGET_ID). Would have pushed:\n${text}`,
    );
    return;
  }

  const res = await fetch("https://api.line.me/v2/bot/message/push", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ to, messages: [{ type: "text", text }] }),
  });

  if (!res.ok) {
    console.error(`[notifications] LINE push failed: ${res.status} ${await res.text()}`);
  }
}

export class LineNotificationProvider implements NotificationProvider {
  async notifyNewOrder(order: Order): Promise<void> {
    const itemNames = order.items.map((item) => `${item.name} x${item.qty}`).join(", ");
    await push(
      `New order: ${order.id}\nStatus: ${order.status}\nCustomer: ${order.customer.name} (${order.customer.phone})\nTotal: ${formatCharged(order.currency, order.totalThb, order.totalUsd)}\nItems: ${itemNames}`,
    );
  }

  async notifyQuoteRequest(details: QuoteRequestDetails): Promise<void> {
    await push(
      `New quote request${details.itemName ? `: ${details.itemName}` : ""}\nFrom: ${details.name} (${details.phone})\n${details.message}`,
    );
  }
}
