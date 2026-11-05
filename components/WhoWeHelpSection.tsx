import Container from "./Container";
import Reveal from "./Reveal";
import { whoWeHelp } from "@/content/site";
import { UserIcon, BriefcaseIcon, UsersIcon } from "./icons";

const ICONS = [UserIcon, BriefcaseIcon, UsersIcon];

export default function WhoWeHelpSection() {
  return (
    <section
      aria-labelledby="who-we-help-heading"
      className="border-t border-line py-20 md:py-32"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-brass">
            {whoWeHelp.eyebrow}
          </p>
          <h2 id="who-we-help-heading" className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
            {whoWeHelp.headline}
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {whoWeHelp.cards.map((card, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={card.title} delay={i * 60}>
                {/* TODO: replace with real photography */}
                <div className="flex aspect-[4/3] items-center justify-center bg-deepteal">
                  <Icon className="h-10 w-10 text-paper/70" />
                </div>
                <h3 className="mt-4 text-lg text-ink">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal">{card.description}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
