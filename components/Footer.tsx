"use client";

import Link from "next/link";
import { useState } from "react";
import Container from "./Container";
import { contactInfo, footerLinks, siteName } from "@/content/site";

export default function Footer() {
  const [lang, setLang] = useState<"EN" | "TH">("EN");

  return (
    <footer className="border-t border-line bg-ink text-paper">
      <Container className="grid grid-cols-1 gap-10 py-16 md:grid-cols-3">
        <div>
          <p className="font-display text-lg">{siteName}</p>
          <p className="mt-4 text-sm text-paper/70">
            {contactInfo.email}
            <br />
            {contactInfo.phone}
          </p>
        </div>

        <nav aria-label="Footer" className="flex flex-col gap-3">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm text-paper/70 transition-colors hover:text-paper"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex flex-col items-start gap-4 md:items-end">
          <div
            role="group"
            aria-label="Language"
            className="flex items-center gap-1 border border-paper/20 text-xs"
          >
            {(["EN", "TH"] as const).map((code) => (
              <button
                key={code}
                type="button"
                onClick={() => setLang(code)}
                aria-pressed={lang === code}
                className={`px-3 py-1.5 transition-colors ${
                  lang === code ? "bg-paper text-ink" : "text-paper/70"
                }`}
              >
                {code}
              </button>
            ))}
          </div>
          <p className="text-xs text-paper/50">
            &copy; {new Date().getFullYear()} {siteName}. All rights reserved.
          </p>
        </div>
      </Container>
    </footer>
  );
}
