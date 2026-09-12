"use server";

import { getItemWithCategory } from "@/content/catalog";
import { itemCopy } from "@/content/catalog-copy";
import { getOrderStore } from "@/lib/orders";
import type { OrderCustomer, OrderItem } from "@/lib/orders/types";
import { paymentProvider, activePaymentProviderName, manualTransferDetails } from "@/lib/payments";
import { notificationProvider } from "@/lib/notifications";
import type { Currency } from "@/lib/currency";

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
  if (cartLines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
    return { ok: false, error: "Name, email, and phone are required." };
  }
  // Manual transfer (PromptPay / Thai bank account) only ever settles in
  // THB - USD checkout requires the card (Stripe) provider.
  if (currency === "USD" && activePaymentProviderName !== "stripe") {
    return { ok: false, error: "USD checkout isn't available right now - please switch to THB, or contact us directly." };
  }

  // Never trust client-submitted prices: every line is recomputed here
  // from the canonical catalog by id.
  const items: OrderItem[] = [];
  for (const line of cartLines) {
    const found = getItemWithCategory(line.id);
    if (!found || found.item.pricing.mode !== "fixed") {
      return { ok: false, error: `One of the items in your cart is no longer available for instant purchase.` };
    }
    if (currency === "USD" && found.item.pricing.usd == null) {
      return { ok: false, error: `One of the items in your cart has no USD price - please switch to THB.` };
    }
    const qty = Math.max(1, Math.min(10, Math.floor(line.qty)));
    items.push({
      itemId: found.item.id,
      categorySlug: found.category.slug,
      name: itemCopy[found.item.id]?.name ?? found.item.tierLabel,
      unitPriceThb: found.item.pricing.thb,
      unitPriceUsd: found.item.pricing.usd,
      qty,
    });
  }

  const totalThb = items.reduce((sum, i) => sum + i.unitPriceThb * i.qty, 0);
  const totalUsd = items.every((i) => i.unitPriceUsd != null)
    ? items.reduce((sum, i) => sum + i.unitPriceUsd! * i.qty, 0)
    : null;

  const orderStore = await getOrderStore();
  const order = await orderStore.create({
    customer,
    items,
    totalThb,
    currency,
    totalUsd,
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

export async function confirmManualPayment(
  orderId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const orderStore = await getOrderStore();
  const order = await orderStore.get(orderId);
  if (!order) return { ok: false, error: "Order not found." };

  const updated = await orderStore.updateStatus(orderId, "pending_verification");
  await notificationProvider.notifyNewOrder(updated);

  return { ok: true };
}
