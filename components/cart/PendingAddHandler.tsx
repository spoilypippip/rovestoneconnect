"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";
import { useAuth } from "@/components/AuthProvider";
import { useCart } from "./CartProvider";
import { getItemWithCategory } from "@/content/catalog";
import { itemCopy } from "@/content/catalog-copy";

/**
 * Completes the add-to-cart a signed-out visitor started: TierCardAction
 * parks the item id in `?add=` and sends them to sign in, and this picks it
 * up when they come back.
 *
 * The id has been through the URL, so it is re-validated here against the
 * catalog exactly as checkout does - it must exist, be fixed-price, and sit
 * in an active category. The param is stripped either way so a refresh
 * can't add the item a second time.
 */
export default function PendingAddHandler() {
  const { user, loading: authLoading } = useAuth();
  const { addItem, ready } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const handled = useRef<string | null>(null);

  const addId = searchParams.get("add");

  useEffect(() => {
    // `ready` matters: adding before the stored cart has been read back would
    // be wiped out by that hydration a moment later.
    if (authLoading || !user || !ready || !addId) return;

    const token = `${pathname}?add=${addId}`;
    if (handled.current === token) return;
    handled.current = token;

    const found = getItemWithCategory(addId);
    if (
      found &&
      found.item.pricing.mode === "fixed" &&
      found.category.visibility === "active"
    ) {
      addItem({
        id: found.item.id,
        categorySlug: found.category.slug,
        categoryName: found.category.name,
        name: itemCopy[found.item.id]?.name ?? found.item.tierLabel,
        unitPriceThb: found.item.pricing.thb,
      });
    }
    // An id that isn't buyable is ignored in silence - it only ever got here
    // by being typed into the URL.

    const params = new URLSearchParams(searchParams.toString());
    params.delete("add");
    const query = params.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [authLoading, user, ready, addId, pathname, searchParams, addItem, router]);

  return null;
}
