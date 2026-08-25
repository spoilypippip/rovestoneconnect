import type { Metadata } from "next";
import Container from "@/components/Container";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | RoveStone Connect",
  description:
    "Request a confidential consultation with RoveStone Connect's Bangkok-based advisory team.",
};

export default function ContactPage() {
  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-xl">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-charcoal">
          Contact
        </p>
        <h1 className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
          Request a consultation.
        </h1>
        <p className="mt-4 text-sm leading-relaxed text-charcoal">
          A confidential conversation, no obligation. We typically respond
          within one business day.
        </p>

        <div className="mt-10">
          <ContactForm />
        </div>
      </Container>
    </section>
  );
}
