"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { useAuth } from "@/components/AuthProvider";
import { safeNext } from "@/lib/auth/safe-next";

type Props = {
  id: string;
  categorySlug: string;
  categoryName: string;
  name: string;
  mode: "fixed" | "quote";
  unitPriceThb?: number;
  recommended: boolean;
};

export default function TierCardAction({
  id,
  categorySlug,
  categoryName,
  name,
  mode,
  unitPriceThb,
  recommended,
}: Props) {
  const { addItem } = useCart();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [added, setAdded] = useState(false);

  const className = `mt-6 inline-block border px-5 py-2.5 text-sm transition-colors disabled:opacity-60 ${
    recommended
      ? "border-paper text-paper hover:bg-paper hover:text-deepteal"
      : "border-brass text-ink hover:bg-brass hover:text-paper"
  }`;

  if (mode === "quote") {
    return (
      <Link href={`/quote-request?item=${encodeURIComponent(id)}`} className={className}>
        Request a Quote
      </Link>
    );
  }

  function handleClick() {
    // Signed-out visitors have no cart at all. Hand the item off through the
    // URL instead: PendingAddHandler adds it once they land back here signed
    // in. Read off `location` rather than useSearchParams so this button
    // doesn't force a Suspense boundary onto every page that renders a tier.
    if (!user) {
      const here = new URL(window.location.href);
      here.searchParams.set("add", id);
      const next = safeNext(`${here.pathname}${here.search}`);
      router.push(`/login?next=${encodeURIComponent(next)}`);
      return;
    }

    addItem({ id, categorySlug, categoryName, name, unitPriceThb: unitPriceThb ?? 0 });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1500);
  }

  return (
    <button
      type="button"
      className={className}
      // Until the session is known we can't tell which of the two this click
      // should do, so don't let it happen yet.
      disabled={authLoading}
      onClick={handleClick}
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
