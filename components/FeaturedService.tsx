import Link from "next/link";
import Container from "./Container";
import Reveal from "./Reveal";
import TierCard from "./TierCard";
import { getCategory } from "@/content/catalog";
import { categoryCopy } from "@/content/catalog-copy";

const FEATURED_CATEGORY_SLUG = "local-information";
const FEATURED_TIER_IDS = [
  "local-information--7-day",
  "local-information--14-day",
  "local-information--30-day",
];

export default function FeaturedService() {
  const category = getCategory(FEATURED_CATEGORY_SLUG);
  if (!category) return null;

  const tiers = FEATURED_TIER_IDS.map((id) =>
    category.items.find((item) => item.id === id),
  ).filter((item): item is NonNullable<typeof item> => Boolean(item));

  return (
    <section id="services" aria-labelledby="services-heading" className="py-20 md:py-32">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-brass">Start Here</p>
          <h2 id="services-heading" className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
            {category.name}
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal">
            {categoryCopy[category.slug]?.tagline}
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {tiers.map((item, i) => (
            <Reveal key={item.id} delay={i * 60}>
              <TierCard item={item} categorySlug={category.slug} categoryName={category.name} />
            </Reveal>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-6">
          <Link
            href={`/services/${category.slug}`}
            className="inline-block border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper"
          >
            See all Local Information tiers
          </Link>
          <Link href="/services" className="text-sm text-brass transition-colors hover:text-ink">
            View all services →
          </Link>
        </div>
      </Container>
    </section>
  );
}
