"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { PLACEHOLDER_EUR_PER_USD, type Currency } from "@/lib/currency";

const STORAGE_KEY = "rovestone-currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  // EUR-per-1-USD rate for browsing-time display only (components/Amount.tsx)
  // - starts at the emergency placeholder and is replaced once the live/
  // cached rate loads from /api/exchange-rate. Checkout never reads this;
  // it resolves and freezes its own rate server-side per order.
  eurPerUsd: number;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("USD");
  const [eurPerUsd, setEurPerUsd] = useState<number>(PLACEHOLDER_EUR_PER_USD);

  useEffect(() => {
    // "THB" can still show up here from a browser that cached it before THB
    // was removed as a selectable option - fall back to the default instead
    // of restoring a now-invalid choice.
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "EUR" || stored === "USD") setCurrencyState(stored);
  }, []);

  useEffect(() => {
    let cancelled = false;
    fetch("/api/exchange-rate")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { eurPerUsd?: number } | null) => {
        if (!cancelled && data?.eurPerUsd) setEurPerUsd(data.eurPerUsd);
      })
      .catch(() => {
        // Network hiccup fetching the display rate - keep the placeholder,
        // no need to surface this to the visitor.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Only persist on an explicit user change, not on every render - a
  // currency-dependent write effect would race the read effect above on
  // mount (each observing the other's stale closure) and revert to THB.
  function setCurrency(next: Currency) {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, eurPerUsd }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
