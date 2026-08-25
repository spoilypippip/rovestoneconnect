import Link from "next/link";
import Container from "./Container";
import Reveal from "./Reveal";
import { catalog } from "@/content/catalog";
import { categoryCopy } from "@/content/catalog-copy";
import { primaryCta } from "@/content/site";

function fromPrice(category: (typeof catalog.categories)[number]) {
  const prices = category.items
    .filter((item) => !item.isAddon && item.pricing.mode === "fixed")
    .map((item) => (item.pricing as { thb: number }).thb);
  return Math.min(...prices);
}

export default function ServicesSection() {
  return (
    <section id="services" aria-labelledby="services-heading" className="py-20 md:py-32">
      <Container>
        <Reveal>
          <h2 id="services-heading" className="max-w-2xl text-3xl tracking-tight text-ink md:text-4xl">
            Every service, in one place.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-charcoal">
            Twelve service lines, each priced by the day, month, or year.
            Pick one to see tiers and add-on services.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {catalog.categories.map((category, i) => (
            <Reveal key={category.slug} delay={i * 40}>
              <Link
                href={`/services/${category.slug}`}
                className="group flex h-full flex-col border border-line p-8 transition-colors hover:border-brass"
              >
                <h3 className="text-xl text-ink">{category.name}</h3>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-charcoal">
                  {categoryCopy[category.slug]?.tagline}
                </p>
                <p className="mt-6 text-sm text-ink">
                  From ฿{fromPrice(category).toLocaleString("en-US")}
                </p>
                <span className="mt-4 text-sm text-brass transition-colors group-hover:text-ink">
                  View tiers →
                </span>
              </Link>
            </Reveal>
          ))}
        </div>

        <div className="mt-10">
          <Link
            href="/#contact"
            className="inline-block border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper"
          >
            {primaryCta}
          </Link>
        </div>
      </Container>
    </section>
  );
}
