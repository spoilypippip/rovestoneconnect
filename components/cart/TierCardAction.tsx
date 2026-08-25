"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "./CartProvider";

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
  const [added, setAdded] = useState(false);

  const className = `mt-6 inline-block border px-5 py-2.5 text-sm transition-colors ${
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

  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        addItem({ id, categorySlug, categoryName, name, unitPriceThb: unitPriceThb ?? 0 });
        setAdded(true);
        window.setTimeout(() => setAdded(false), 1500);
      }}
    >
      {added ? "Added" : "Add to Cart"}
    </button>
  );
}
