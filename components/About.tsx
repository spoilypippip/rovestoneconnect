import Image from "next/image";
import Container from "./Container";
import Reveal from "./Reveal";
import { about } from "@/content/site";

const team = [
  { initials: "SK", image: "/images/team-sk.jpg" },
  { initials: "DL", image: "/images/team-dl.jpg" },
  { initials: "AN", image: "/images/team-an.jpg" },
  { initials: "PW", image: "/images/team-pw.jpg" },
];

export default function About() {
  return (
    <section
      id="about"
      aria-labelledby="about-heading"
      className="border-t border-line py-20 md:py-32"
    >
      <Container className="grid grid-cols-1 gap-14 lg:grid-cols-2 lg:items-center">
        <Reveal>
          <h2 id="about-heading" className="max-w-lg text-3xl tracking-tight text-ink md:text-4xl">
            {about.heading}
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-charcoal">
            {about.body}
          </p>
        </Reveal>

        <Reveal delay={100}>
          <div className="grid grid-cols-2 gap-4">
            {team.map((member) => (
              <div
                key={member.initials}
                className="relative flex aspect-square overflow-hidden border border-line"
              >
                <Image
                  src={member.image}
                  alt="Team member"
                  fill
                  className="object-cover"
                  sizes="(min-width: 1024px) 25vw, 50vw"
                />
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
