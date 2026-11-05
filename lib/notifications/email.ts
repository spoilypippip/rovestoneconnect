import type { Order } from "@/lib/orders/types";
import type {
  ContactMessageDetails,
  NotificationProvider,
  NotificationResult,
  QuoteRequestDetails,
} from "./types";
import { formatCharged } from "@/lib/currency";
import { EMAIL_PATTERN } from "@/lib/validation/contact";

// What kind of alert a log line is about. Safe to log anywhere: it says
// nothing about the person the alert concerns.
type NotificationKind = "new-order" | "quote-request" | "contact-message";

/**
 * Every notification body here contains the customer's name, email, and
 * phone number. In production that must not reach the server log - on
 * Vercel those lines are retained and readable by anyone with project
 * access. Locally the full text is exactly what you want to see, since
 * nothing is being delivered.
 */
function reportUnconfigured(kind: NotificationKind, ref: string, subject: string, text: string) {
  const missing = "RESEND_API_KEY/NOTIFICATION_EMAIL_FROM/NOTIFICATION_EMAIL_TO";

  if (process.env.NODE_ENV === "production") {
    console.error(
      `[notifications] Email not configured (missing ${missing}). Dropped ${kind} ${ref} unsent; contents withheld because they contain personal data.`,
    );
    return;
  }

  console.warn(
    `[notifications] Email not configured (missing ${missing}). Would have sent ${kind} ${ref}: "${subject}"\n${text}`,
  );
}

// TODO: set RESEND_API_KEY, NOTIFICATION_EMAIL_FROM, and
// NOTIFICATION_EMAIL_TO before launch. Until they are set nothing is
// delivered, and this says so in its return value rather than failing
// silently - the contact form shows the customer an error instead of a
// false "thank you".
/**
 * @param replyTo Goes into Resend's `reply_to`, so replying to the alert
 *   reaches the customer. Re-checked here because it arrives from a public
 *   form and ends up in an outgoing header - a malformed one is left off
 *   rather than allowed to fail the send.
 */
async function send(
  kind: NotificationKind,
  ref: string,
  subject: string,
  text: string,
  replyTo?: string,
): Promise<NotificationResult> {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.NOTIFICATION_EMAIL_FROM;
  const to = process.env.NOTIFICATION_EMAIL_TO;

  if (!apiKey || !from || !to) {
    reportUnconfigured(kind, ref, subject, text);
    return { ok: false, reason: "not-configured" };
  }

  const safeReplyTo = replyTo && EMAIL_PATTERN.test(replyTo) ? replyTo : undefined;
  if (replyTo && !safeReplyTo) {
    console.error(`[notifications] Ignored a malformed reply-to address on ${kind} ${ref}.`);
  }

  let res: Response;
  try {
    res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to,
        subject,
        text,
        ...(safeReplyTo ? { reply_to: safeReplyTo } : {}),
      }),
    });
  } catch (error) {
    console.error(`[notifications] Resend request for ${kind} ${ref} failed: ${(error as Error).message}`);
    return { ok: false, reason: "delivery-failed" };
  }

  if (!res.ok) {
    console.error(
      `[notifications] Resend request for ${kind} ${ref} failed: ${res.status} ${await res.text()}`,
    );
    return { ok: false, reason: "delivery-failed" };
  }

  return { ok: true };
}

export class EmailNotificationProvider implements NotificationProvider {
  async notifyNewOrder(order: Order): Promise<NotificationResult> {
    const itemLines = order.items
      .map(
        (item) =>
          `  - ${item.name} x${item.qty} (${formatCharged(order.currency, item.unitPriceThb, item.unitPriceUsd, item.unitPriceEur)} each)`,
      )
      .join("\n");

    return send(
      "new-order",
      order.id,
      `New order ${order.status === "pending_verification" ? "awaiting verification" : "created"}: ${order.id}`,
      [
        `Order: ${order.id}`,
        `Status: ${order.status}`,
        `Customer: ${order.customer.name} <${order.customer.email}>, ${order.customer.phone}`,
        order.customer.company ? `Company: ${order.customer.company}` : null,
        `Total: ${formatCharged(order.currency, order.totalThb, order.totalUsd, order.totalEur)}`,
        "Items:",
        itemLines,
      ]
        .filter(Boolean)
        .join("\n"),
    );
  }

  async notifyQuoteRequest(details: QuoteRequestDetails): Promise<NotificationResult> {
    return send(
      "quote-request",
      crypto.randomUUID(),
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
      // Validated in app/quote-request/actions.ts before it gets here, so
      // the team can just hit reply.
      details.email,
    );
  }

  async notifyContactMessage(details: ContactMessageDetails): Promise<NotificationResult> {
    return send(
      "contact-message",
      crypto.randomUUID(),
      `New consultation request${details.serviceName ? `: ${details.serviceName}` : ""}`,
      [
        details.serviceName
          ? `Service: ${details.serviceName} (${details.serviceSlug})`
          : "Service: not specified",
        `From: ${details.name} <${details.email}>`,
        details.phone ? `Phone: ${details.phone}` : null,
        details.company ? `Company: ${details.company}` : null,
        "Message:",
        details.message,
      ]
        .filter(Boolean)
        .join("\n"),
      // Validated in app/contact/actions.ts before it gets here, so the
      // team can just hit reply.
      details.email,
    );
  }
}
