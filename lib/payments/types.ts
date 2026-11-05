import type { Order } from "@/lib/orders/types";

export type PaymentEvent = {
  orderId: string;
  status: "paid" | "pending" | "failed";
  // Why a webhook event was left "pending" rather than applied - set when a
  // session failed its order/amount/currency check, or when the payment is
  // a delayed method that hasn't settled yet. For logging only.
  reason?: string;
};

/**
 * Looks an order up by id so a webhook can check the gateway's amounts
 * against what we actually charged. Passed in by the route handler rather
 * than imported here so payment providers stay independent of the order
 * store.
 */
export type OrderLookup = (orderId: string) => Promise<Order | null>;

/**
 * No payment gateway has been chosen yet. Every gateway integration
 * implements this same interface so the checkout flow never has to
 * change when a real provider (Omise/Opn, 2C2P, ...) is wired in —
 * only the PAYMENT_PROVIDER env var and this module's export do.
 */
export interface PaymentProvider {
  createCheckoutSession(order: Order): Promise<{ redirectUrl?: string; sessionId: string }>;
  /**
   * `order` is required, not optional: a gateway reference alone proves a
   * payment happened, never that it was *this* order's payment. Providers
   * must confirm the reference belongs to `order` (and is for its amount
   * and currency) before ever reporting "paid".
   */
  verifyPayment(reference: string, order: Order): Promise<{ status: "paid" | "pending" | "failed" }>;
  handleWebhook(payload: unknown, headers: Headers, lookupOrder: OrderLookup): Promise<PaymentEvent>;
}
