import type { Metadata } from "next";
import Container from "@/components/Container";
import { privacyPolicy, type PrivacyBlock } from "@/content/privacy";

export const metadata: Metadata = {
  title: "Privacy Policy | RoveStone Connect",
  description:
    "How RoveStone Connect collects, uses, and protects personal data under Thailand's PDPA.",
};

// An unresolved business or legal decision. Deliberately loud: a draft
// shouldn't be able to go live with these still in it.
function TodoNote({ text }: { text: string }) {
  return (
    <p className="border-l-2 border-brass py-1 pl-4 text-sm leading-relaxed text-brass">
      [{text}]
    </p>
  );
}

function Block({ block }: { block: PrivacyBlock }) {
  switch (block.type) {
    case "subheading":
      return <h3 className="mt-8 text-sm font-medium text-ink">{block.text}</h3>;
    case "list":
      return (
        <ul className="list-disc space-y-2 pl-5 text-sm leading-relaxed text-charcoal marker:text-brass">
          {block.items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      );
    case "todo":
      return <TodoNote text={block.text} />;
    default:
      return <p className="text-sm leading-relaxed text-charcoal">{block.text}</p>;
  }
}

export default function PrivacyPage() {
  const policy = privacyPolicy.EN;

  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-2xl">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-charcoal">
          {policy.eyebrow}
        </p>
        <h1 className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
          {policy.title}
        </h1>

        <div className="mt-6 space-y-4">
          <p className="text-xs uppercase tracking-[0.1em] text-charcoal/70">
            {policy.effectiveDateLabel}
          </p>
          <Block block={policy.effectiveDate} />
        </div>

        <div className="mt-8 space-y-4 border-t border-line pt-8">
          {policy.intro.map((block, i) => (
            <Block key={i} block={block} />
          ))}
        </div>

        {policy.sections.map((section) => (
          <div key={section.id} id={section.id} className="mt-14 scroll-mt-24">
            <h2 className="text-lg text-ink">{section.heading}</h2>
            <div className="mt-4 space-y-4">
              {section.blocks.map((block, i) => (
                <Block key={i} block={block} />
              ))}
            </div>
          </div>
        ))}
      </Container>
    </section>
  );
}
