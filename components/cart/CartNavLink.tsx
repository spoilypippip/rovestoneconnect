"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";

export default function CartNavLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="text-sm text-charcoal transition-colors hover:text-ink"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      Cart{count > 0 ? ` (${count})` : ""}
    </Link>
  );
}
