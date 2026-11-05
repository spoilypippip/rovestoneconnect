"use server";

import { getItemWithCategory } from "@/content/catalog";
import { itemCopy } from "@/content/catalog-copy";
import { getOrderStore } from "@/lib/orders";
import type { OrderCustomer, OrderItem } from "@/lib/orders/types";
import { paymentProvider, activePaymentProviderName, manualTransferDetails } from "@/lib/payments";
import { notificationProvider } from "@/lib/notifications";
import { usdToEur, type Currency } from "@/lib/currency";
import { getEurPerUsdRate } from "@/lib/exchange-rate";
import { createClient } from "@/lib/supabase/server";

// Only signed-in customers can buy. The proxy redirects them to /login
// first, but a Server Action is a public HTTP endpoint - it has to check
// for itself rather than trust that they came through the UI.
async function signedIn(): Promise<boolean> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user != null;
}

const SIGN_IN_REQUIRED = { ok: false, error: "Please sign in to continue." } as const;

export type CheckoutLineInput = { id: string; qty: number };

export type CreateOrderResult =
  | {
      ok: true;
      orderId: string;
      sessionId: string;
      redirectUrl?: string;
      payment: typeof manualTransferDetails;
    }
  | { ok: false; error: string };

export async function createOrder(
  customer: OrderCustomer,
  cartLines: CheckoutLineInput[],
  currency: Currency,
): Promise<CreateOrderResult> {
  if (!(await signedIn())) return SIGN_IN_REQUIRED;

  if (cartLines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
    return { ok: false, error: "Name, email, and phone are required." };
  }
  // Manual transfer (PromptPay / Thai bank account) only ever settles in
  // THB - USD/EUR checkout requires the card (Stripe) provider.
  if ((currency === "USD" || currency === "EUR") && activePaymentProviderName !== "stripe") {
    return { ok: false, error: "Card checkout isn't available right now - please contact us directly." };
  }

  // Resolved ONCE per order and reused for every line below - this is the
  // rate that gets frozen onto the order. Nothing downstream (confirmation
  // page, email/LINE notifications) may call usdToEur/getEurPerUsdRate
  // again for this order; they only ever read the persisted unitPriceEur/
  // totalEur values computed here.
  const eurPerUsdRate = currency === "EUR" ? await getEurPerUsdRate() : null;

  // Never trust client-submitted prices: every line is recomputed here
  // from the canonical catalog by id.
  const items: OrderItem[] = [];
  for (const line of cartLines) {
    const found = getItemWithCategory(line.id);
    if (!found || found.item.pricing.mode !== "fixed") {
      return { ok: false, error: `One of the items in your cart is no longer available for instant purchase.` };
    }
    // Trust boundary: a hidden category must be unpurchasable even via a
    // hand-crafted request that never touched the (already-filtered) UI.
    if (found.category.visibility !== "active") {
      return { ok: false, error: `One of the items in your cart is no longer available for instant purchase.` };
    }
    // EUR is derived from the USD price (see lib/currency.ts), so it needs
    // the item to have one exactly as much as USD checkout does.
    if ((currency === "USD" || currency === "EUR") && found.item.pricing.usd == null) {
      return {
        ok: false,
        error: `One of the items in your cart has no USD price on record, so USD/EUR checkout isn't available for it - please contact us directly.`,
      };
    }
    const qty = Math.max(1, Math.min(10, Math.floor(line.qty)));
    items.push({
      itemId: found.item.id,
      categorySlug: found.category.slug,
      name: itemCopy[found.item.id]?.name ?? found.item.tierLabel,
      unitPriceThb: found.item.pricing.thb,
      unitPriceUsd: found.item.pricing.usd,
      unitPriceEur:
        eurPerUsdRate != null && found.item.pricing.usd != null
          ? usdToEur(found.item.pricing.usd, eurPerUsdRate)
          : null,
      qty,
    });
  }

  const totalThb = items.reduce((sum, i) => sum + i.unitPriceThb * i.qty, 0);
  const totalUsd = items.every((i) => i.unitPriceUsd != null)
    ? items.reduce((sum, i) => sum + i.unitPriceUsd! * i.qty, 0)
    : null;
  const totalEur = items.every((i) => i.unitPriceEur != null)
    ? items.reduce((sum, i) => sum + i.unitPriceEur! * i.qty, 0)
    : null;

  const orderStore = await getOrderStore();
  const order = await orderStore.create({
    customer,
    items,
    totalThb,
    currency,
    totalUsd,
    totalEur,
    paymentProvider: activePaymentProviderName,
  });

  const session = await paymentProvider.createCheckoutSession(order);

  return {
    ok: true,
    orderId: order.id,
    sessionId: session.sessionId,
    redirectUrl: session.redirectUrl,
    payment: manualTransferDetails,
  };
}

// What a customer pressing "I've paid" is told when the order isn't in a
// state that claim can apply to.
const UNCONFIRMABLE_STATUS: Record<string, string> = {
  paid: "This order is already paid - nothing left to confirm.",
  failed: "This order's payment was marked failed. Please start a new order or contact us.",
  cancelled: "This order was cancelled. Please start a new order or contact us.",
};

/**
 * The customer telling us they've made the bank/PromptPay transfer. This is
 * an unauthenticated claim about an order id, so it may only ever move a
 * manual-transfer order from "pending_payment" to "pending_verification" -
 * a human still checks the transfer landed before anything becomes "paid".
 * It must never overwrite a Stripe order's status or a settled one.
 */
export async function confirmManualPayment(
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!(await signedIn())) return SIGN_IN_REQUIRED;

  const orderStore = await getOrderStore();
  const order = await orderStore.get(orderId);
  if (!order) return { ok: false, error: "Order not found." };

  if (order.paymentProvider !== "manual-transfer") {
    return {
      ok: false,
      error: "This order is paid by card, so it can't be confirmed as a bank transfer.",
    };
  }

  // Idempotent: a double-click or a resubmitted form must not notify staff
  // about the same transfer twice.
  if (order.status === "pending_verification") return { ok: true };

  if (order.status !== "pending_payment") {
    return {
      ok: false,
      error: UNCONFIRMABLE_STATUS[order.status] ?? "This order can no longer be confirmed.",
    };
  }

  const updated = await orderStore.updateStatus(orderId, "pending_verification");
  await notificationProvider.notifyNewOrder(updated);

  return { ok: true };
}
