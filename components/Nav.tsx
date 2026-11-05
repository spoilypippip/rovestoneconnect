import Link from "next/link";
import Container from "./Container";
import CartNavLink from "./cart/CartNavLink";
import CurrencyToggle from "./CurrencyToggle";
import AccountMenu from "./AccountMenu";
import MobileNav from "./MobileNav";
import { navLinks, primaryCta, siteName } from "@/content/site";

export default function Nav() {
  return (
    <header className="sticky top-0 z-50 border-b border-line/70 bg-paper/70 backdrop-blur">
      <Container className="flex h-[72px] items-center justify-between">
        <Link href="/" className="shrink-0 font-display text-lg tracking-tight text-ink">
          {siteName}
        </Link>

        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
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

        <div className="flex items-center gap-4">
          <div className="hidden items-center gap-4 md:flex">
            <CurrencyToggle />
            <CartNavLink />
            <AccountMenu />
          </div>

          <div className="flex items-center gap-3 md:hidden">
            <CartNavLink />
            <AccountMenu />
            <MobileNav />
          </div>

          <Link
            href="/#contact"
            className="ml-1 shrink-0 border border-brass px-4 py-2 text-sm text-ink transition-colors hover:bg-brass hover:text-paper md:ml-2 md:px-5 md:py-2.5"
          >
            {/* Full text doesn't fit next to the cart/account/hamburger
                cluster below ~450px (see the mobile Nav overflow bug) -
                shorten it there instead of shrinking the shared primaryCta
                string used elsewhere on the site. */}
            <span className="sm:hidden">Consult</span>
            <span className="hidden sm:inline">{primaryCta}</span>
          </Link>
        </div>
      </Container>
    </header>
  );
}
