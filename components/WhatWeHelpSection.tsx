import Link from "next/link";
import Container from "./Container";
import Reveal from "./Reveal";
import { whatWeHelp } from "@/content/site";
import { SpeechBubbleIcon, DocumentIcon, PersonGearIcon } from "./icons";

const ICONS = [SpeechBubbleIcon, DocumentIcon, PersonGearIcon];

export default function WhatWeHelpSection() {
  return (
    <section aria-labelledby="what-we-help-heading" className="py-20 md:py-32">
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-brass">
            {whatWeHelp.eyebrow}
          </p>
          <h2 id="what-we-help-heading" className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
            {whatWeHelp.headline}
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-3">
          {whatWeHelp.columns.map((column, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={column.title} delay={i * 60}>
                <Icon className="h-8 w-8 text-brass" />
                <h3 className="mt-4 text-lg text-ink">{column.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal">{column.description}</p>
                <p className="mt-2 text-xs text-charcoal/60">{column.example}</p>
                {/* TODO: point to real category pages once other services are unhidden */}
                <Link
                  href="/#contact"
                  className="mt-4 inline-block text-sm text-brass transition-colors hover:text-ink"
                >
                  {column.linkLabel}
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
