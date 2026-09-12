import { ManualTransferProvider } from "./manual-transfer";
import { StripeCheckoutProvider } from "./stripe";
import type { PaymentProvider } from "./types";

// Manual transfer is the default so local development and demos need no
// external account. Set STRIPE_SECRET_KEY (and, before going live,
// STRIPE_WEBHOOK_SECRET - see stripe.ts) to switch a deployment to Stripe
// Checkout instead.
export const activePaymentProviderName = process.env.STRIPE_SECRET_KEY ? "stripe" : "manual-transfer";

export const paymentProvider: PaymentProvider =
  activePaymentProviderName === "stripe" ? new StripeCheckoutProvider() : new ManualTransferProvider();

export { manualTransferDetails } from "./manual-transfer";
export type { PaymentEvent, PaymentProvider } from "./types";
