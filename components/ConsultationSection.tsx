import Container from "./Container";
import Reveal from "./Reveal";
import ContactForm from "./ContactForm";

export default function ConsultationSection() {
  return (
    <section
      id="contact"
      aria-labelledby="consultation-heading"
      className="border-t border-line py-20 md:py-32"
    >
      <Container className="mx-auto max-w-xl">
        <Reveal>
          <h2 id="consultation-heading" className="text-3xl tracking-tight text-ink md:text-4xl">
            Request a consultation.
          </h2>
          <p className="mt-4 text-sm leading-relaxed text-charcoal">
            A confidential conversation, no obligation. We typically respond
            within one business day.
          </p>
        </Reveal>

        <Reveal delay={80} className="mt-10">
          <ContactForm />
        </Reveal>
      </Container>
    </section>
  );
}
