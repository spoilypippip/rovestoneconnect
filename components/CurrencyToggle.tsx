"use client";

import { useRef, useState } from "react";
import { useCurrency } from "@/components/CurrencyProvider";
import type { Currency } from "@/lib/currency";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { ChevronDownIcon } from "./icons";

const OPTIONS: Currency[] = ["EUR", "USD"];

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Currency"
        className="flex items-center gap-1 text-xs text-charcoal transition-colors hover:text-ink"
      >
        {currency}
        <ChevronDownIcon className={`h-3 w-3 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Currency"
          className="absolute right-0 top-full mt-2 min-w-[6rem] border border-line bg-paper py-1 text-xs shadow-sm"
        >
          {OPTIONS.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={currency === option}
              onClick={() => {
                setCurrency(option);
                setOpen(false);
              }}
              className={`block w-full px-4 py-1.5 text-left transition-colors hover:bg-line/40 ${
                currency === option ? "text-ink" : "text-charcoal hover:text-ink"
              }`}
            >
              {option}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
