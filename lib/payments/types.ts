import type { Order } from "@/lib/orders/types";

export type PaymentEvent = {
  orderId: string;
  status: "paid" | "pending" | "failed";
};

/**
 * No payment gateway has been chosen yet. Every gateway integration
 * implements this same interface so the checkout flow never has to
 * change when a real provider (Omise/Opn, 2C2P, ...) is wired in —
 * only the PAYMENT_PROVIDER env var and this module's export do.
 */
export interface PaymentProvider {
  createCheckoutSession(order: Order): Promise<{ redirectUrl?: string; sessionId: string }>;
  verifyPayment(reference: string): Promise<{ status: "paid" | "pending" | "failed" }>;
  handleWebhook(payload: unknown, headers: Headers): Promise<PaymentEvent>;
}
