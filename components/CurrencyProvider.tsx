"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Currency } from "@/lib/currency";

const STORAGE_KEY = "rovestone-currency";

type CurrencyContextValue = {
  currency: Currency;
  setCurrency: (currency: Currency) => void;
};

const CurrencyContext = createContext<CurrencyContextValue | null>(null);

export function CurrencyProvider({ children }: { children: React.ReactNode }) {
  const [currency, setCurrencyState] = useState<Currency>("THB");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === "THB" || stored === "USD") setCurrencyState(stored);
  }, []);

  // Only persist on an explicit user change, not on every render - a
  // currency-dependent write effect would race the read effect above on
  // mount (each observing the other's stale closure) and revert to THB.
  function setCurrency(next: Currency) {
    setCurrencyState(next);
    localStorage.setItem(STORAGE_KEY, next);
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
}

export function useCurrency(): CurrencyContextValue {
  const ctx = useContext(CurrencyContext);
  if (!ctx) throw new Error("useCurrency must be used within a CurrencyProvider");
  return ctx;
}
