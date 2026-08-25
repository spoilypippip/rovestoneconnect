import { ManualTransferProvider } from "./manual-transfer";
import type { PaymentProvider } from "./types";

// TODO: once a gateway is chosen (Omise/Opn or 2C2P are the two most
// relevant for a Thai-registered business taking foreign cards), add a
// second class implementing PaymentProvider and select it here via
// PAYMENT_PROVIDER, e.g. `process.env.PAYMENT_PROVIDER === "omise"`.
export const paymentProvider: PaymentProvider = new ManualTransferProvider();

export { manualTransferDetails } from "./manual-transfer";
export type { PaymentEvent, PaymentProvider } from "./types";
