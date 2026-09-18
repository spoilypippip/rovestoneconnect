import Image from "next/image";
import Link from "next/link";
import Container from "./Container";
import { hero } from "@/content/site";

export default function Hero() {
  return (
    <section className="relative -mt-[72px] flex min-h-[712px] items-center overflow-hidden bg-ink md:min-h-[832px]">
      <Image
        src="/images/hero-banner.jpeg"
        alt="Traditional long-tail boat resting on calm emerald bay waters, Thailand"
        fill
        priority
        className="object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[linear-gradient(155deg,var(--color-deepteal)_0%,var(--color-ink)_65%)] opacity-70 mix-blend-multiply"
      />
      <div
        aria-hidden
        className="absolute inset-0 bg-[radial-gradient(circle_at_78%_22%,rgba(156,122,60,0.16),transparent_55%)]"
      />
      <div aria-hidden className="absolute inset-0 bg-ink/25" />

      <Container className="relative py-16 md:py-24">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-paper/70">
          {hero.eyebrow}
        </p>
        <h1 className="mt-5 max-w-3xl text-[2.5rem] leading-[1.1] tracking-tight text-paper md:text-[3.75rem]">
          {hero.headline}
        </h1>
        <p className="mt-6 max-w-xl text-base leading-relaxed text-paper/80 md:text-lg">
          {hero.subhead}
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Link
            href="/services"
            className="inline-block border border-brass bg-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-transparent hover:text-paper"
          >
            {hero.primaryCta}
          </Link>
          <Link
            href="/#contact"
            className="inline-block border border-paper/40 px-6 py-3 text-sm text-paper transition-colors hover:border-brass hover:bg-brass"
          >
            {hero.secondaryCta}
          </Link>
        </div>
      </Container>
    </section>
  );
}
