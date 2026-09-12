import Container from "./Container";
import Reveal from "./Reveal";
import { testimonials } from "@/content/site";

export default function Testimonials() {
  return (
    <section aria-labelledby="testimonials-heading" className="py-20 md:py-32">
      <Container>
        <h2 id="testimonials-heading" className="sr-only">
          Client notes
        </h2>
        <div className="-mx-6 flex snap-x snap-mandatory gap-12 overflow-x-auto px-6 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {testimonials.map((item, i) => (
            <Reveal
              key={i}
              delay={i * 70}
              className="w-[85%] shrink-0 snap-start md:w-[45%]"
            >
              <blockquote className="border-l border-brass pl-6">
                <p className="text-lg leading-relaxed text-ink">
                  &ldquo;{item.quote}&rdquo;
                </p>
                <footer className="mt-4 text-sm text-charcoal">
                  {item.name}
                  {item.role && (
                    <span className="text-charcoal/70">, {item.role}</span>
                  )}
                </footer>
              </blockquote>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
