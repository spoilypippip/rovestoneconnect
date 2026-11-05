import Container from "./Container";
import Reveal from "./Reveal";
import { howConnectWorks } from "@/content/site";

export default function HowItWorksSection() {
  return (
    <section
      aria-labelledby="how-it-works-heading"
      className="border-t border-line py-20 md:py-32"
    >
      <Container>
        <Reveal className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-brass">
            {howConnectWorks.eyebrow}
          </p>
          <h2 id="how-it-works-heading" className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
            {howConnectWorks.headline}
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {howConnectWorks.steps.map((step, i) => (
            <Reveal key={step.number} delay={i * 70}>
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-brass font-display text-sm text-brass">
                  {step.number}
                </span>
                {i < howConnectWorks.steps.length - 1 && (
                  <span aria-hidden className="hidden h-px flex-1 bg-line lg:block" />
                )}
              </div>
              <h3 className="mt-4 text-lg text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal">{step.description}</p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
