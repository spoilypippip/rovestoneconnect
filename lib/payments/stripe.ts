import Stripe from "stripe";
import type { Order } from "@/lib/orders/types";
import type { PaymentEvent, PaymentProvider } from "./types";

// THB and USD both have two decimal places (satang, cents) in Stripe's API,
// same as most currencies - only a short zero-decimal list (JPY, KRW, ...)
// differs.
const TO_MINOR_UNIT = 100;

function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

function requireStripeSecretKey(): string {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error("STRIPE_SECRET_KEY is not configured.");
  return key;
}

let client: Stripe | null = null;

function getClient(): Stripe {
  if (!client) client = new Stripe(requireStripeSecretKey());
  return client;
}

/**
 * Stripe Checkout (hosted page, redirect flow) - selected automatically by
 * lib/payments/index.ts once STRIPE_SECRET_KEY is set. Order status only
 * ever moves to "paid" from the webhook (checkout.session.completed);
 * verifyPayment is a read-only fallback for the confirmation page in case
 * the customer's redirect back beats the webhook.
 *
 * Setup the business owner (not this codebase) must do before this is
 * live, none of which happens automatically:
 *   1. Create a Stripe account and get it activated for payouts.
 *   2. Set STRIPE_SECRET_KEY (Dashboard > Developers > API keys).
 *   3. Add a webhook endpoint pointing at
 *      `${SITE_URL}/api/webhooks/stripe` listening for
 *      `checkout.session.completed`, then set STRIPE_WEBHOOK_SECRET to
 *      its signing secret.
 *   4. Set SITE_URL to the site's real https origin (not needed on
 *      Vercel, which sets VERCEL_URL automatically).
 * This was intentionally left for a human to do with their own Stripe
 * account credentials rather than being scripted here.
 */
export class StripeCheckoutProvider implements PaymentProvider {
  async createCheckoutSession(order: Order): Promise<{ redirectUrl?: string; sessionId: string }> {
    const session = await getClient().checkout.sessions.create({
      mode: "payment",
      client_reference_id: order.id,
      metadata: { orderId: order.id },
      customer_email: order.customer.email,
      line_items: order.items.map((item) => {
        const unitPrice = order.currency === "USD" ? item.unitPriceUsd : item.unitPriceThb;
        if (unitPrice == null) {
          throw new Error(`Item ${item.itemId} has no ${order.currency} price recorded on this order.`);
        }
        return {
          quantity: item.qty,
          price_data: {
            currency: order.currency.toLowerCase(),
            unit_amount: Math.round(unitPrice * TO_MINOR_UNIT),
            product_data: { name: item.name },
          },
        };
      }),
      success_url: `${siteUrl()}/order/${order.id}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/checkout`,
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return { redirectUrl: session.url, sessionId: session.id };
  }

  async verifyPayment(reference: string): Promise<{ status: "paid" | "pending" | "failed" }> {
    const session = await getClient().checkout.sessions.retrieve(reference);
    if (session.payment_status === "paid") return { status: "paid" };
    if (session.status === "expired") return { status: "failed" };
    return { status: "pending" };
  }

  async handleWebhook(payload: unknown, headers: Headers): Promise<PaymentEvent> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    if (typeof payload !== "string") {
      throw new Error("Stripe webhook payload must be the raw request body text.");
    }

    const signature = headers.get("stripe-signature");
    if (!signature) throw new Error("Missing stripe-signature header.");

    const event = await getClient().webhooks.constructEventAsync(payload, signature, secret);

    if (event.type !== "checkout.session.completed") {
      // Acknowledged but ignored - we only act on the one event type we
      // subscribed to; Stripe retries on non-2xx, so any other event
      // Stripe sends here (if the endpoint is later subscribed to more)
      // must still return a status rather than throw.
      return { orderId: "", status: "pending" };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (!orderId) throw new Error("Stripe checkout session has no orderId reference.");

    return {
      orderId,
      status: session.payment_status === "paid" ? "paid" : "failed",
    };
  }
}
