import Container from "./Container";
import Reveal from "./Reveal";
import { whyConnect } from "@/content/site";
import { ShieldIcon, DocumentIcon, LocationPinIcon, LightbulbIcon } from "./icons";

const ICONS = [ShieldIcon, DocumentIcon, LocationPinIcon, LightbulbIcon];

export default function WhyConnectSection() {
  return (
    <section
      aria-labelledby="why-connect-heading"
      className="border-t border-line py-20 md:py-32"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-brass">
            {whyConnect.eyebrow}
          </p>
          <h2 id="why-connect-heading" className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
            {whyConnect.headline}
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {whyConnect.columns.map((column, i) => {
            const Icon = ICONS[i];
            return (
              <Reveal key={column.title} delay={i * 60}>
                <Icon className="h-8 w-8 text-brass" />
                <h3 className="mt-4 text-lg text-ink">{column.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-charcoal">{column.description}</p>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
