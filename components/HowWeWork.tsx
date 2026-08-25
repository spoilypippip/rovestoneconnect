import Container from "./Container";
import Reveal from "./Reveal";
import { processSteps } from "@/content/site";

export default function HowWeWork() {
  return (
    <section
      id="how-we-work"
      aria-labelledby="how-we-work-heading"
      className="border-t border-line py-20 md:py-32"
    >
      <Container>
        <Reveal>
          <h2 id="how-we-work-heading" className="max-w-2xl text-3xl tracking-tight text-ink md:text-4xl">
            How we work.
          </h2>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
          {processSteps.map((step, i) => (
            <Reveal key={step.number} delay={i * 70}>
              <p className="font-display text-2xl text-brass">{step.number}</p>
              <h3 className="mt-3 text-lg text-ink">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-charcoal">
                {step.description}
              </p>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
