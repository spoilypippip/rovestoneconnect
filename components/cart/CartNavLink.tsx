"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { CartIcon } from "@/components/icons";

export default function CartNavLink() {
  const { count } = useCart();

  return (
    <Link
      href="/cart"
      className="relative flex items-center text-charcoal transition-colors hover:text-ink"
      aria-label={`Cart, ${count} item${count === 1 ? "" : "s"}`}
    >
      <CartIcon className="h-5 w-5" />
      {count > 0 && (
        <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-brass px-1 text-[10px] leading-none text-paper">
          {count}
        </span>
      )}
    </Link>
  );
}
