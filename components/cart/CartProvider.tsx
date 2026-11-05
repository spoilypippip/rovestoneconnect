"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAuth } from "@/components/AuthProvider";
import { getCategory } from "@/content/catalog";

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
  // False until the signed-in user's stored cart has been read back. Anything
  // that adds to or clears the cart on page load must wait for this, or its
  // change would be overwritten by the hydration that lands right after it.
  ready: boolean;
  addItem: (line: Omit<CartLine, "qty">, qty?: number) => void;
  removeItem: (id: string) => void;
  setQty: (id: string, qty: number) => void;
  clear: () => void;
  subtotalThb: number;
  count: number;
};

const CartContext = createContext<CartContextValue | null>(null);

// Keyed per signed-in user so a shared browser never shows one person's
// leftover cart to whoever's signed in next. There is no key for signed-out
// visitors: they can't buy, so they don't get a cart at all.
const STORAGE_PREFIX = "rovestone-cart";
// Written by the previous build, when signed-out visitors had a cart. Removed
// on first load so an abandoned guest cart can't resurface.
const LEGACY_GUEST_KEY = `${STORAGE_PREFIX}:guest`;

// A stored cart is dropped this long after the last change to it. Prices and
// availability drift, and a months-old cart is noise rather than intent.
export const CART_TTL_DAYS = 7;
const CART_TTL_MS = CART_TTL_DAYS * 24 * 60 * 60 * 1000;

type StoredCart = { lines: CartLine[]; updatedAt: number };

function storageKey(userId: string): string {
  return `${STORAGE_PREFIX}:${userId}`;
}

/**
 * Reads either shape we've ever written: the current
 * `{ lines, updatedAt }` envelope, or the bare `CartLine[]` array that
 * predates it. A legacy array has no timestamp, so it can't be expired -
 * it gets its first `updatedAt` the next time the cart changes.
 */
function parseStoredCart(raw: string): { lines: CartLine[]; updatedAt: number | null } | null {
  const parsed: unknown = JSON.parse(raw);

  if (Array.isArray(parsed)) {
    return { lines: parsed as CartLine[], updatedAt: null };
  }
  if (parsed && typeof parsed === "object" && Array.isArray((parsed as StoredCart).lines)) {
    const updatedAt = Number((parsed as StoredCart).updatedAt);
    return {
      lines: (parsed as StoredCart).lines,
      updatedAt: Number.isFinite(updatedAt) ? updatedAt : null,
    };
  }
  return null;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  const [lines, setLines] = useState<CartLine[]>([]);
  const [hydratedKey, setHydratedKey] = useState<string | null>(null);
  // The exact array hydration produced. While `lines` is still that array
  // nothing has changed, so there is nothing to persist - which keeps the
  // TTL measured from the last real change rather than the last page view.
  const hydratedLines = useRef<CartLine[] | null>(null);

  useEffect(() => {
    if (authLoading) return;

    try {
      window.localStorage.removeItem(LEGACY_GUEST_KEY);
    } catch {
      // Storage unavailable (private mode, blocked cookies) - nothing to clean.
    }

    if (!userId) {
      // Signed out: no cart, and nothing read from or written to storage.
      hydratedLines.current = null;
      setLines([]);
      setHydratedKey(null);
      return;
    }

    let restored: CartLine[] = [];
    try {
      const raw = window.localStorage.getItem(storageKey(userId));
      const stored = raw ? parseStoredCart(raw) : null;

      if (stored?.updatedAt != null && Date.now() - stored.updatedAt > CART_TTL_MS) {
        window.localStorage.removeItem(storageKey(userId));
      } else if (stored) {
        // Silently drop lines from a category that's since been hidden (e.g.
        // added before a temporary sales pause) - checkout would reject them
        // anyway, this just keeps the cart from showing something unbuyable.
        restored = stored.lines.filter(
          (line) => getCategory(line.categorySlug)?.visibility === "active",
        );
      }
    } catch {
      // Corrupt or inaccessible storage: start with an empty cart.
      restored = [];
    }

    hydratedLines.current = restored;
    setLines(restored);
    setHydratedKey(userId);
  }, [userId, authLoading]);

  useEffect(() => {
    if (!userId || hydratedKey !== userId) return;
    if (lines === hydratedLines.current) return;

    const payload: StoredCart = { lines, updatedAt: Date.now() };
    try {
      window.localStorage.setItem(storageKey(userId), JSON.stringify(payload));
    } catch {
      // Storage full or unavailable - the in-memory cart still works for
      // this session.
    }
  }, [lines, hydratedKey, userId]);

  const ready = userId != null && hydratedKey === userId;

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

    return { lines, ready, addItem, removeItem, setQty, clear, subtotalThb, count };
  }, [lines, ready]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
