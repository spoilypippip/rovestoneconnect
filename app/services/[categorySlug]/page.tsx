import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Container from "@/components/Container";
import Reveal from "@/components/Reveal";
import TierCard from "@/components/TierCard";
import { catalog, getCategory } from "@/content/catalog";
import { categoryCopy } from "@/content/catalog-copy";

export function generateStaticParams() {
  return catalog.categories.map((category) => ({ categorySlug: category.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}): Promise<Metadata> {
  const { categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) return {};

  return {
    title: `${category.name} | RoveStone Connect`,
    description: categoryCopy[category.slug]?.tagline,
  };
}

export default async function CategoryPage({
  params,
}: {
  params: Promise<{ categorySlug: string }>;
}) {
  const { categorySlug } = await params;
  const category = getCategory(categorySlug);
  if (!category) notFound();

  const coreTiers = category.items.filter((item) => !item.isAddon);
  const addons = category.items.filter((item) => item.isAddon);

  return (
    <section className="py-20 md:py-32">
      <Container>
        <Reveal className="max-w-2xl">
          <Link href="/services" className="text-sm text-charcoal transition-colors hover:text-ink">
            ← All Services
          </Link>
          <h1 className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">{category.name}</h1>
          <p className="mt-5 text-base leading-relaxed text-charcoal">
            {categoryCopy[category.slug]?.tagline}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {coreTiers.map((item, i) => (
            <Reveal key={item.id} delay={i * 60}>
              <TierCard item={item} categorySlug={category.slug} categoryName={category.name} />
            </Reveal>
          ))}
        </div>

        {addons.length > 0 && (
          <div className="mt-20 border-t border-line pt-14">
            <Reveal>
              <h2 className="text-xl text-ink">Execution &amp; add-on services</h2>
              <p className="mt-3 max-w-xl text-sm leading-relaxed text-charcoal">
                Standalone follow-on services. Purchasable on their own or
                alongside a tier above.
              </p>
            </Reveal>

            <div className="mt-10 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {addons.map((item, i) => (
                <Reveal key={item.id} delay={i * 60}>
                  <TierCard item={item} categorySlug={category.slug} categoryName={category.name} />
                </Reveal>
              ))}
            </div>
          </div>
        )}
      </Container>
    </section>
  );
}
