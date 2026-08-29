"use client";

import Link from "next/link";
import Container from "@/components/Container";
import { useCart } from "@/components/cart/CartProvider";

function formatTHB(n: number) {
  return `฿${n.toLocaleString("en-US")}`;
}

export default function CartPage() {
  const { lines, setQty, removeItem, subtotalThb } = useCart();

  if (lines.length === 0) {
    return (
      <section className="py-20 md:py-32">
        <Container className="mx-auto max-w-xl text-center">
          <h1 className="text-3xl tracking-tight text-ink md:text-4xl">Your cart is empty.</h1>
          <p className="mt-4 text-sm leading-relaxed text-charcoal">
            Browse our services to find one to add.
          </p>
          <Link
            href="/services"
            className="mt-8 inline-block border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper"
          >
            Browse Services
          </Link>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-2xl">
        <h1 className="text-3xl tracking-tight text-ink md:text-4xl">Your cart.</h1>

        <div className="mt-10 divide-y divide-line border-t border-line">
          {lines.map((line) => (
            <div key={line.id} className="flex items-start justify-between gap-6 py-6">
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-[0.1em] text-charcoal/70">
                  {line.categoryName}
                </p>
                <p className="mt-1 text-base text-ink">{line.name}</p>
                <p className="mt-1 text-sm text-charcoal">
                  {formatTHB(line.unitPriceThb)} each
                </p>

                <div className="mt-3 flex items-center gap-3">
                  <label htmlFor={`qty-${line.id}`} className="sr-only">
                    Quantity for {line.name}
                  </label>
                  <select
                    id={`qty-${line.id}`}
                    value={line.qty}
                    onChange={(e) => setQty(line.id, Number(e.target.value))}
                    className="border border-line bg-paper px-3 py-1.5 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brass"
                  >
                    {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
                      <option key={n} value={n}>
                        {n}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => removeItem(line.id)}
                    className="text-sm text-charcoal underline decoration-line underline-offset-4 transition-colors hover:text-ink hover:decoration-brass"
                  >
                    Remove
                  </button>
                </div>
              </div>

              <p className="shrink-0 text-base text-ink">
                {formatTHB(line.unitPriceThb * line.qty)}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
          <span className="text-base text-ink">Subtotal</span>
          <span className="text-lg text-ink">{formatTHB(subtotalThb)}</span>
        </div>

        <Link
          href="/checkout"
          className="mt-8 inline-block border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper"
        >
          Proceed to Checkout
        </Link>
      </Container>
    </section>
  );
}
