import type { Order } from "@/lib/orders/types";
import type { NotificationProvider, QuoteRequestDetails } from "./types";
import { formatCharged } from "@/lib/currency";

// TODO: set RESEND_API_KEY, NOTIFICATION_EMAIL_FROM, and
// NOTIFICATION_EMAIL_TO before launch. Until then this logs to the
// server console instead of sending, so checkout and quote requests
// never fail just because email isn't configured yet.
async function send(subject: string, text: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_EMAIL_FROM;
  const to = process.env.NOTIFICATION_EMAIL_TO;

  if (!apiKey || !from || !to) {
    console.warn(
      `[notifications] Email not configured (missing RESEND_API_KEY/NOTIFICATION_EMAIL_FROM/NOTIFICATION_EMAIL_TO). Would have sent: "${subject}"\n${text}`,
    );
    return;
  }

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to, subject, text }),
  });

  if (!res.ok) {
    console.error(`[notifications] Resend request failed: ${res.status} ${await res.text()}`);
  }
}

export class EmailNotificationProvider implements NotificationProvider {
  async notifyNewOrder(order: Order): Promise<void> {
    const itemLines = order.items
      .map(
        (item) =>
          `  - ${item.name} x${item.qty} (${formatCharged(order.currency, item.unitPriceThb, item.unitPriceUsd)} each)`,
      )
      .join("\n");

    await send(
      `New order ${order.status === "pending_verification" ? "awaiting verification" : "created"}: ${order.id}`,
      [
        `Order: ${order.id}`,
        `Status: ${order.status}`,
        `Customer: ${order.customer.name} <${order.customer.email}>, ${order.customer.phone}`,
        order.customer.company ? `Company: ${order.customer.company}` : null,
        `Total: ${formatCharged(order.currency, order.totalThb, order.totalUsd)}`,
        "Items:",
        itemLines,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  async notifyQuoteRequest(details: QuoteRequestDetails): Promise<void> {
    await send(
      `New quote request${details.itemName ? `: ${details.itemName}` : ""}`,
      [
        details.itemName ? `Service: ${details.itemName} (${details.itemId})` : "Service: not specified",
        `From: ${details.name} <${details.email}>, ${details.phone}`,
        details.company ? `Company: ${details.company}` : null,
        "Message:",
        details.message,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }
}
