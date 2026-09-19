import Link from "next/link";
import Container from "./Container";
import Reveal from "./Reveal";
import TierCard from "./TierCard";
import { getCategory } from "@/content/catalog";
import { categoryCopy } from "@/content/catalog-copy";

const FEATURED_CATEGORY_SLUG = "local-information";
const FEATURED_TIER_IDS = [
  "local-information--30-day",
  "local-information--7-day",
  "local-information--14-day",
  "local-information--1-year",
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

        <div className="-mx-6 mt-14 flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {tiers.map((item, i) => (
            <Reveal
              key={item.id}
              delay={i * 60}
              className="w-[78%] shrink-0 snap-start sm:w-[55%] lg:w-[30%]"
            >
              {item.recommended ? (
                <TierCard item={item} categorySlug={category.slug} categoryName={category.name} />
              ) : (
                // Equal height across the non-recommended tiers only, scoped
                // to this carousel (TierCard itself takes no className, and
                // must stay auto-height on /services/[categorySlug] where it
                // already stretches via CSS Grid). flex + min-h stretches
                // TierCard's own border box to fill it, unlike a plain
                // min-h wrapper which would just leave dead space below the
                // card. 320px ~= padding (48px) + title (32px) + the
                // longest of the three descriptions, "Annual Partnership"
                // at 122 chars, wrapping to ~5 lines at the narrowest
                // (mobile) card width (~126px) + price row (48px) + button
                // (~69px) - an estimate, not measured in a real browser.
                <div className="flex min-h-[320px]">
                  <TierCard item={item} categorySlug={category.slug} categoryName={category.name} />
                </div>
              )}
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/#contact"
            className="inline-block border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper"
          >
            Talk to our team
          </Link>
        </div>
      </Container>
    </section>
  );
}
