import { getOrderStore } from "@/lib/orders";
import { paymentProvider } from "@/lib/payments";
import { notificationProvider } from "@/lib/notifications";

// Signature verification needs the exact raw bytes Stripe signed - a
// framework body parser would re-serialize JSON and break it. Route
// Handlers don't parse the body automatically, so request.text() here is
// already the raw payload.
export const runtime = "nodejs";

export async function POST(request: Request) {
  const rawBody = await request.text();

  let event;
  try {
    event = await paymentProvider.handleWebhook(rawBody, request.headers);
  } catch (error) {
    return Response.json({ error: (error as Error).message }, { status: 400 });
  }

  if (event.orderId) {
    const orderStore = await getOrderStore();
    const order = await orderStore.updateStatus(event.orderId, event.status === "paid" ? "paid" : "failed");
    if (event.status === "paid") {
      await notificationProvider.notifyNewOrder(order);
    }
  }

  return Response.json({ received: true });
}
