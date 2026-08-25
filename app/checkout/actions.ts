"use server";

import { getItemWithCategory } from "@/content/catalog";
import { getOrderStore } from "@/lib/orders";
import type { OrderCustomer, OrderItem } from "@/lib/orders/types";
import { paymentProvider, manualTransferDetails } from "@/lib/payments";
import { notificationProvider } from "@/lib/notifications";

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
): Promise<CreateOrderResult> {
  if (cartLines.length === 0) {
    return { ok: false, error: "Your cart is empty." };
  }
  if (!customer.name.trim() || !customer.email.trim() || !customer.phone.trim()) {
    return { ok: false, error: "Name, email, and phone are required." };
  }

  // Never trust client-submitted prices: every line is recomputed here
  // from the canonical catalog by id.
  const items: OrderItem[] = [];
  for (const line of cartLines) {
    const found = getItemWithCategory(line.id);
    if (!found || found.item.pricing.mode !== "fixed") {
      return { ok: false, error: `One of the items in your cart is no longer available for instant purchase.` };
    }
    const qty = Math.max(1, Math.min(10, Math.floor(line.qty)));
    items.push({
      itemId: found.item.id,
      categorySlug: found.category.slug,
      name: found.item.tierLabel,
      unitPriceThb: found.item.pricing.thb,
      qty,
    });
  }

  const totalThb = items.reduce((sum, i) => sum + i.unitPriceThb * i.qty, 0);

  const orderStore = await getOrderStore();
  const order = await orderStore.create({
    customer,
    items,
    totalThb,
    paymentProvider: "manual-transfer",
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
