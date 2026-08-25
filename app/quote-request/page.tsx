import type { Metadata } from "next";
import Container from "@/components/Container";
import { getItemWithCategory } from "@/content/catalog";
import { itemCopy } from "@/content/catalog-copy";
import QuoteRequestForm from "./QuoteRequestForm";

export const metadata: Metadata = {
  title: "Request a Quote | RoveStone Connect",
  description: "Request a quote for a variable-scope RoveStone Connect service.",
};

export default async function QuoteRequestPage({
  searchParams,
}: {
  searchParams: Promise<{ item?: string }>;
}) {
  const { item: itemId } = await searchParams;
  const found = itemId ? getItemWithCategory(itemId) : undefined;
  const itemName = found ? (itemCopy[found.item.id]?.name ?? found.item.tierLabel) : null;

  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-charcoal">
          Request a Quote
        </p>
        <h1 className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
          Tell us the scope, we&rsquo;ll price it.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal">
          Some engagements vary too much to price instantly. Share a few
          details and we&rsquo;ll come back with a fixed quote.
        </p>

        <div className="mt-10">
          <QuoteRequestForm itemId={found?.item.id ?? null} itemName={itemName} />
        </div>
      </Container>
    </section>
  );
}
