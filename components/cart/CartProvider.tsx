"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartLine = {
  id: string; // catalog item id
  categorySlug: string;
  categoryName: string;
  name: string;
  unitPriceThb: number;
  qty: number;
};

type CartContextValue = {
  lines: CartLine[];
  addItem: (line: Omit<CartLine, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotalThb: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "rovestone-cart";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw));
    } catch {
      // Corrupt or inaccessible storage: start with an empty cart.
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const value = useMemo<CartContextValue>(() => {
    const addItem: CartContextValue["addItem"] = (line, qty = 1) => {
      setLines((prev) => {
        const existing = prev.find((l) => l.id === line.id);
        if (existing) {
          return prev.map((l) => (l.id === line.id ? { ...l, qty: l.qty + qty } : l));
        }
        return [...prev, { ...line, qty }];
      });
    };

    const removeItem: CartContextValue["removeItem"] = (id) => {
      setLines((prev) => prev.filter((l) => l.id !== id));
    };

    const setQty: CartContextValue["setQty"] = (id, qty) => {
      if (qty < 1) {
        removeItem(id);
        return;
      }
      setLines((prev) => prev.map((l) => (l.id === id ? { ...l, qty } : l)));
    };

    const clear = () => setLines([]);

    const subtotalThb = lines.reduce((sum, l) => sum + l.unitPriceThb * l.qty, 0);
    const count = lines.reduce((sum, l) => sum + l.qty, 0);

    return { lines, addItem, removeItem, setQty, clear, subtotalThb, count };
  }, [lines]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
