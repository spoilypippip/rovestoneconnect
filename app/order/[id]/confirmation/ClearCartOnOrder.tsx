"use client";

import { useEffect } from "react";
import { useCart } from "@/components/cart/CartProvider";
import type { OrderStatus } from "@/lib/orders/types";

// One marker per order, so the cart is emptied once and anything added
// afterwards survives a reload of this page (or a second visit to it from
// the browser's history).
const CLEARED_PREFIX = "rovestone-cart-cleared";

type Props = {
  orderId: string;
  status: OrderStatus;
  paymentProvider: string;
  hasStripeSession: boolean;
};

/**
 * Empties the cart once the order it holds has actually been placed. Runs
 * on the confirmation page because that is the one point every payment
 * route passes through - card and bank transfer alike.
 */
export default function ClearCartOnOrder({
  orderId,
  status,
  paymentProvider,
  hasStripeSession,
}: Props) {
  const { clear, ready } = useCart();

  useEffect(() => {
    // Wait for the stored cart to be read back, or hydration would simply
    // restore what we just cleared.
    if (!ready) return;

    // "paid" and "pending_verification" are settled. The Stripe case covers
    // the gap where the customer is back from Checkout but the webhook
    // hasn't landed yet and the order still reads "pending_payment".
    const placed =
      status === "paid" ||
      status === "pending_verification" ||
      (paymentProvider === "stripe" && hasStripeSession);
    if (!placed) return;

    const key = `${CLEARED_PREFIX}:${orderId}`;
    try {
      if (window.localStorage.getItem(key)) return;
      window.localStorage.setItem(key, "1");
    } catch {
      // No storage to remember this in: clearing once per page load is
      // still better than leaving a bought-and-paid-for cart behind.
    }

    clear();
  }, [ready, status, paymentProvider, hasStripeSession, orderId, clear]);

  return null;
}
