import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { getOrderStore } from "@/lib/orders";
import { paymentProvider } from "@/lib/payments";
import { formatCharged } from "@/lib/currency";

function lineDeepLink(orderId: string, itemNames: string[]): string | null {
  // TODO: set LINE_OA_ID (the "@..." handle from the LINE Official
  // Account Manager) before launch.
  const oaId = process.env.LINE_OA_ID;
  if (!oaId) return null;

  const summary = itemNames.length === 1 ? itemNames[0] : "my RoveStone Connect order";
  const text = `Hi, I just purchased ${summary}. Order #${orderId}.`;
  return `https://line.me/R/oaMessage/@${oaId}/?${encodeURIComponent(text)}`;
}

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { id } = await params;
  const { session_id: stripeSessionId } = await searchParams;
  const orderStore = await getOrderStore();
  let order = await orderStore.get(id);
  if (!order) notFound();

  // Stripe's redirect back to this page can arrive before its webhook
  // does. If so, this fills the gap by checking the session directly
  // rather than showing a stale "pending" status the webhook would
  // otherwise correct moments later.
  if (order.status === "pending_payment" && stripeSessionId) {
    const result = await paymentProvider.verifyPayment(stripeSessionId);
    if (result.status !== "pending") {
      order = await orderStore.updateStatus(id, result.status === "paid" ? "paid" : "failed");
    }
  }

  const lineHref = lineDeepLink(
    order.id,
    order.items.map((i) => i.name),
  );

  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-xl text-center">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-charcoal">
          Order Confirmed
        </p>
        <h1 className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
          Thank you, {order.customer.name.split(" ")[0]}.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal">
          Order #{order.id}.{" "}
          {order.status === "paid"
            ? "Payment received - we're on it."
            : "We're verifying your payment now and will confirm shortly."}
        </p>

        <div className="mt-10 divide-y divide-line border-y border-line text-left">
          {order.items.map((item) => (
            <div key={item.itemId} className="flex items-baseline justify-between gap-4 py-4">
              <span className="text-sm text-charcoal">
                {item.name} × {item.qty}
              </span>
              <span className="text-sm text-ink">
                {formatCharged(
                  order.currency,
                  item.unitPriceThb * item.qty,
                  item.unitPriceUsd != null ? item.unitPriceUsd * item.qty : null,
                )}
              </span>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <span className="text-sm text-ink">Total</span>
            <span className="text-base text-ink">
              {formatCharged(order.currency, order.totalThb, order.totalUsd)}
            </span>
          </div>
        </div>

        <div className="mt-12 border border-brass p-8">
          <h2 className="text-lg text-ink">Continue on LINE</h2>
          <p className="mt-2 text-sm leading-relaxed text-charcoal">
            For the fastest follow-up, message our team directly. We&rsquo;ll
            pick up right where this order left off.
          </p>
          {lineHref ? (
            <a
              href={lineHref}
              className="mt-6 inline-block border border-brass bg-brass px-6 py-3 text-sm text-paper transition-colors hover:bg-ink hover:border-ink"
            >
              Continue on LINE
            </a>
          ) : (
            <p className="mt-6 text-xs text-charcoal/60">
              LINE handoff isn&rsquo;t configured yet. In the meantime, we&rsquo;ll reach out at{" "}
              {order.customer.email}.
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
