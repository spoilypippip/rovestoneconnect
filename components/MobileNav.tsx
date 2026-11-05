"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { navLinks } from "@/content/site";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { MenuIcon, CloseIcon } from "./icons";
import CurrencyToggle from "./CurrencyToggle";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="flex items-center text-charcoal transition-colors hover:text-ink"
      >
        {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
      </button>

      {open && (
        <div className="fixed inset-x-6 top-[72px] z-50 border border-line bg-paper p-6 shadow-sm">
          <nav aria-label="Primary" className="flex flex-col gap-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-sm text-charcoal transition-colors hover:text-ink"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <div className="mt-6 border-t border-line pt-6">
            <CurrencyToggle />
          </div>
        </div>
      )}
    </div>
  );
}
