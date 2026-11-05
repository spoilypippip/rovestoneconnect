import { getOrderStore } from "@/lib/orders";
import type { OrderStatus } from "@/lib/orders/types";
import { paymentProvider } from "@/lib/payments";
import { notificationProvider } from "@/lib/notifications";

// Signature verification needs the exact raw bytes Stripe signed - a
// framework body parser would re-serialize JSON and break it. Route
// Handlers don't parse the body automatically, so request.text() here is
// already the raw payload.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const orderStore = await getOrderStore();

  let event;
  try {
    event = await paymentProvider.handleWebhook(rawBody, request.headers, (orderId) =>
      orderStore.get(orderId),
    );
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }

  // "pending" means the event told us nothing actionable: an event type we
  // don't act on, a delayed payment still in flight, or a session that
  // failed its amount/currency check. Never touch the order's status.
  if (!event.orderId || event.status === "pending") {
    if (event.reason) {
      console.info(`[stripe-webhook] No status change for order ${event.orderId || "(none)"}: ${event.reason}`);
    }
    return Response.json({ received: true });
  }

  const order = await orderStore.get(event.orderId);
  if (!order) {
    console.error(`[stripe-webhook] Order ${event.orderId} not found; ignoring ${event.status} event.`);
    return Response.json({ received: true });
  }

  // "paid" is terminal. Stripe redelivers events and can send a late
  // expired/failed event for a session that already settled; neither may
  // walk a paid order back.
  if (order.status === "paid") {
    return Response.json({ received: true });
  }

  const nextStatus: OrderStatus = event.status === "paid" ? "paid" : "failed";
  // Already in that state (a redelivery of the same event): don't write and,
  // crucially, don't notify twice.
  if (order.status === nextStatus) {
    return Response.json({ received: true });
  }

  const updated = await orderStore.updateStatus(event.orderId, nextStatus);
  if (nextStatus === "paid") {
    await notificationProvider.notifyNewOrder(updated);
  }

  return Response.json({ received: true });
}
