import { notFound } from "next/navigation";
import Container from "@/components/Container";
import { getOrderStore } from "@/lib/orders";

function formatTHB(n: number) {
  return `฿${n.toLocaleString("en-US")}`;
}

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const orderStore = await getOrderStore();
  const order = await orderStore.get(id);
  if (!order) notFound();

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
          Order #{order.id}. We&rsquo;re verifying your transfer now and will
          confirm shortly.
        </p>

        <div className="mt-10 divide-y divide-line border-y border-line text-left">
          {order.items.map((item) => (
            <div key={item.itemId} className="flex items-baseline justify-between gap-4 py-4">
              <span className="text-sm text-charcoal">
                {item.name} × {item.qty}
              </span>
              <span className="text-sm text-ink">{formatTHB(item.unitPriceThb * item.qty)}</span>
            </div>
          ))}
          <div className="flex items-baseline justify-between gap-4 py-4">
            <span className="text-sm text-ink">Total</span>
            <span className="text-base text-ink">{formatTHB(order.totalThb)}</span>
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
