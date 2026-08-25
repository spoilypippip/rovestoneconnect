import Container from "./Container";
import { trustBar } from "@/content/site";

export default function TrustBar() {
  return (
    <div className="border-b border-line bg-paper py-6">
      <Container>
        <ul className="flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-center">
          {trustBar.map((item) => (
            <li
              key={item}
              className="text-xs font-medium uppercase tracking-[0.1em] text-charcoal"
            >
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </div>
  );
}
