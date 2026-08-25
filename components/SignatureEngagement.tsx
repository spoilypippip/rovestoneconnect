import Link from "next/link";
import Container from "./Container";
import Reveal from "./Reveal";
import { primaryCta, signatureEngagement } from "@/content/site";

export default function SignatureEngagement() {
  return (
    <section aria-labelledby="signature-heading" className="bg-deepteal py-20 md:py-32">
      <Container>
        <Reveal className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-medium uppercase tracking-[0.12em] text-paper/70">
            Signature Engagement
          </p>
          <h2 id="signature-heading" className="mt-5 text-3xl tracking-tight text-paper md:text-4xl">
            {signatureEngagement.heading}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-paper/80">
            {signatureEngagement.body}
          </p>
          <Link
            href="/#contact"
            className="mt-8 inline-block border border-brass px-6 py-3 text-sm text-paper transition-colors hover:bg-brass"
          >
            {primaryCta}
          </Link>
        </Reveal>
      </Container>
    </section>
  );
}
