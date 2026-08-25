import type { Order } from "@/lib/orders/types";
import type { PaymentEvent, PaymentProvider } from "./types";

// TODO: the business owner needs to fill these in (PromptPay ID and bank
// details) before launch. Until then the checkout page shows the
// placeholder values below so the flow can be built and demoed end to end.
export const manualTransferDetails = {
  promptPayId: process.env.PROMPTPAY_ID ?? "TODO: PromptPay ID",
  bankName: process.env.BANK_NAME ?? "TODO: Bank name",
  bankAccountName: process.env.BANK_ACCOUNT_NAME ?? "TODO: Account name",
  bankAccountNumber: process.env.BANK_ACCOUNT_NUMBER ?? "TODO: Account number",
};

/**
 * Mirrors how many small Thai businesses actually operate at launch: the
 * customer transfers manually and staff confirm the transfer by hand.
 * Needs no third-party account to ship. Order status becomes
 * "pending_verification" (never "paid") until a human confirms the
 * transfer landed — there is no automatic verification path here.
 */
export class ManualTransferProvider implements PaymentProvider {
  async createCheckoutSession(order: Order): Promise<{ redirectUrl?: string; sessionId: string }> {
    // No external gateway to redirect to: the checkout page renders the
    // QR/bank-details step itself once it has a session id.
    return { sessionId: order.id };
  }

  async verifyPayment(): Promise<{ status: "paid" | "pending" | "failed" }> {
    // There is no automated signal for a manual bank transfer. Staff
    // confirm it out of band; until then it stays "pending".
    return { status: "pending" };
  }

  async handleWebhook(): Promise<PaymentEvent> {
    throw new Error("ManualTransferProvider has no webhook: transfers are confirmed manually.");
  }
}
