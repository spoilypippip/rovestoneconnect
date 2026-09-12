"use client";

import { useCurrency } from "@/components/CurrencyProvider";
import type { Currency } from "@/lib/currency";

const OPTIONS: Currency[] = ["THB", "USD"];

export default function CurrencyToggle() {
  const { currency, setCurrency } = useCurrency();

  return (
    <div role="group" aria-label="Currency" className="flex shrink-0 border border-line text-xs">
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          aria-pressed={currency === option}
          onClick={() => setCurrency(option)}
          className={`px-2.5 py-1.5 transition-colors ${
            currency === option ? "bg-ink text-paper" : "text-charcoal hover:text-ink"
          }`}
        >
          {option}
        </button>
      ))}
    </div>
  );
}
