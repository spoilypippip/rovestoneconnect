import Link from "next/link";
import Container from "./Container";
import CartNavLink from "./cart/CartNavLink";
import { navLinks, primaryCta, siteName } from "@/content/site";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line bg-paper/90 backdrop-blur">
      <Container className="flex h-[72px] items-center justify-between">
        <Link
          href="/"
          className="font-display text-lg tracking-tight text-ink"
        >
          {siteName}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-charcoal transition-colors hover:text-ink"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-5">
          <CartNavLink />

          <Link
            href="/#contact"
            className="hidden shrink-0 border border-brass px-5 py-2.5 text-sm text-ink transition-colors hover:bg-brass hover:text-paper lg:inline-block"
          >
            {primaryCta}
          </Link>

          <Link
            href="/#contact"
            className="border border-brass px-4 py-2 text-sm text-ink lg:hidden"
          >
            {primaryCta}
          </Link>
        </div>
      </Container>
    </header>
  );
}
