import Stripe from "stripe";
import type { Order, OrderItem } from "@/lib/orders/types";
import type { OrderLookup, PaymentEvent, PaymentProvider } from "./types";

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
 * The amount Stripe is told to charge for one unit of `item`, in the
 * currency's minor unit. Used both to build the Checkout session and to
 * re-derive what that session's `amount_total` must be when verifying it -
 * they must never drift apart, so there is exactly one implementation.
 */
function unitAmountMinor(order: Order, item: OrderItem): number {
  const unitPrice =
    order.currency === "USD"
      ? item.unitPriceUsd
      : order.currency === "EUR"
        ? item.unitPriceEur
        : item.unitPriceThb;
  if (unitPrice == null) {
    throw new Error(`Item ${item.itemId} has no ${order.currency} price recorded on this order.`);
  }
  return Math.round(unitPrice * TO_MINOR_UNIT);
}

/**
 * What `session.amount_total` has to be for a session that really belongs
 * to this order. Rounds per unit and then multiplies, exactly as the line
 * items do - rounding the order total instead could be off by a satang/cent.
 */
function expectedAmountTotal(order: Order): number {
  return order.items.reduce((sum, item) => sum + unitAmountMinor(order, item) * item.qty, 0);
}

/**
 * Returns a human-readable reason the session must NOT be treated as this
 * order's payment, or null if it checks out. A session id proves only that
 * *some* payment happened: without these checks a customer could take the
 * session id of their own cheap paid order and append it to an expensive
 * unpaid one to have it marked paid.
 */
function sessionMismatchReason(session: Stripe.Checkout.Session, order: Order): string | null {
  const sessionOrderId = session.metadata?.orderId ?? session.client_reference_id;
  if (sessionOrderId !== order.id) {
    return `session belongs to order ${sessionOrderId ?? "(none)"}, not ${order.id}`;
  }

  const sessionCurrency = session.currency?.toLowerCase() ?? null;
  if (sessionCurrency !== order.currency.toLowerCase()) {
    return `session currency ${sessionCurrency ?? "(none)"} does not match order currency ${order.currency}`;
  }

  let expected: number;
  try {
    expected = expectedAmountTotal(order);
  } catch (error) {
    return (error as Error).message;
  }
  if (session.amount_total !== expected) {
    return `session amount_total ${session.amount_total ?? "(none)"} does not match order total ${expected}`;
  }

  return null;
}

/**
 * Stripe Checkout (hosted page, redirect flow) - selected automatically by
 * lib/payments/index.ts once STRIPE_SECRET_KEY is set. Order status only
 * ever moves to "paid" from the webhook (checkout.session.completed or,
 * for delayed payment methods, checkout.session.async_payment_succeeded);
 * verifyPayment is a read-only fallback for the confirmation page in case
 * the customer's redirect back beats the webhook.
 *
 * Setup the business owner (not this codebase) must do before this is
 * live, none of which happens automatically:
 *   1. Create a Stripe account and get it activated for payouts.
 *   2. Set STRIPE_SECRET_KEY (Dashboard > Developers > API keys).
 *   3. Add a webhook endpoint pointing at
 *      `${SITE_URL}/api/webhooks/stripe` listening for
 *      `checkout.session.completed`,
 *      `checkout.session.async_payment_succeeded`,
 *      `checkout.session.async_payment_failed` and
 *      `checkout.session.expired`, then set STRIPE_WEBHOOK_SECRET to its
 *      signing secret.
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
      line_items: order.items.map((item) => ({
        quantity: item.qty,
        price_data: {
          currency: order.currency.toLowerCase(),
          unit_amount: unitAmountMinor(order, item),
          product_data: { name: item.name },
        },
      })),
      success_url: `${siteUrl()}/order/${order.id}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl()}/checkout`,
    });

    if (!session.url) throw new Error("Stripe did not return a Checkout URL.");
    return { redirectUrl: session.url, sessionId: session.id };
  }

  async verifyPayment(
    reference: string,
    order: Order,
  ): Promise<{ status: "paid" | "pending" | "failed" }> {
    const session = await getClient().checkout.sessions.retrieve(reference);

    // A session that isn't this order's says nothing about this order -
    // not even that it failed. Leave the order untouched for the webhook.
    const mismatch = sessionMismatchReason(session, order);
    if (mismatch) {
      console.error(`[stripe] Ignoring Checkout session ${reference} for order ${order.id}: ${mismatch}`);
      return { status: "pending" };
    }

    if (session.payment_status === "paid") return { status: "paid" };
    if (session.status === "expired") return { status: "failed" };
    // Includes delayed methods (PromptPay, bank debits) still in flight.
    return { status: "pending" };
  }

  async handleWebhook(
    payload: unknown,
    headers: Headers,
    lookupOrder: OrderLookup,
  ): Promise<PaymentEvent> {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) throw new Error("STRIPE_WEBHOOK_SECRET is not configured.");
    if (typeof payload !== "string") {
      throw new Error("Stripe webhook payload must be the raw request body text.");
    }

    const signature = headers.get("stripe-signature");
    if (!signature) throw new Error("Missing stripe-signature header.");

    const event = await getClient().webhooks.constructEventAsync(payload, signature, secret);

    if (
      event.type !== "checkout.session.completed" &&
      event.type !== "checkout.session.async_payment_succeeded" &&
      event.type !== "checkout.session.async_payment_failed" &&
      event.type !== "checkout.session.expired"
    ) {
      // Acknowledged but ignored - we only act on the event types we
      // subscribed to; Stripe retries on non-2xx, so any other event
      // Stripe sends here (if the endpoint is later subscribed to more)
      // must still return a status rather than throw.
      return { orderId: "", status: "pending", reason: `unhandled event type ${event.type}` };
    }

    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId ?? session.client_reference_id;
    if (!orderId) throw new Error("Stripe checkout session has no orderId reference.");

    if (
      event.type === "checkout.session.async_payment_failed" ||
      event.type === "checkout.session.expired"
    ) {
      return { orderId, status: "failed", reason: event.type };
    }

    // checkout.session.completed fires as soon as the customer finishes the
    // hosted page, which for a delayed method (PromptPay, bank debit) is
    // before any money has moved. That is "still paying", not "failed" -
    // async_payment_succeeded/failed decides it later.
    if (event.type === "checkout.session.completed" && session.payment_status !== "paid") {
      return {
        orderId,
        status: "pending",
        reason: `payment_status=${session.payment_status}, awaiting async payment result`,
      };
    }

    // Second line of defence behind verifyPayment: even a Stripe-signed
    // session only marks this order paid if it is for this order's exact
    // amount and currency.
    const order = await lookupOrder(orderId);
    if (!order) {
      const reason = `order ${orderId} not found`;
      console.error(`[stripe] Refusing to apply ${event.type} for session ${session.id}: ${reason}`);
      return { orderId, status: "pending", reason };
    }

    const mismatch = sessionMismatchReason(session, order);
    if (mismatch) {
      console.error(`[stripe] Refusing to apply ${event.type} for session ${session.id}: ${mismatch}`);
      return { orderId, status: "pending", reason: mismatch };
    }

    return { orderId, status: "paid" };
  }
}
