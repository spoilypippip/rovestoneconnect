"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Container from "@/components/Container";
import { useCart } from "@/components/cart/CartProvider";
import { createOrder, confirmManualPayment, type CreateOrderResult } from "./actions";
import type { OrderCustomer } from "@/lib/orders/types";
import { getItem } from "@/content/catalog";
import Amount from "@/components/Amount";
import { useCurrency } from "@/components/CurrencyProvider";

function unitUsd(id: string): number | null {
  const item = getItem(id);
  return item?.pricing.mode === "fixed" ? item.pricing.usd : null;
}

export default function CheckoutPage() {
  const router = useRouter();
  const { lines, subtotalThb, clear } = useCart();
  const { currency } = useCurrency();
  const subtotalUsd = lines.reduce<number | null>((sum, line) => {
    const usd = unitUsd(line.id);
    return sum == null || usd == null ? null : sum + usd * line.qty;
  }, 0);
  const [session, setSession] = useState<Extract<CreateOrderResult, { ok: true }> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (lines.length === 0 && !session) {
      router.replace("/cart");
    }
  }, [lines.length, session, router]);

  async function handleDetailsSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const form = new FormData(e.currentTarget);
    const customer: OrderCustomer = {
      name: String(form.get("name") ?? ""),
      company: String(form.get("company") ?? "") || null,
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      preferredLanguage: form.get("preferredLanguage") === "TH" ? "TH" : "EN",
    };

    const result = await createOrder(
      customer,
      lines.map((l) => ({ id: l.id, qty: l.qty })),
      currency,
    );
    setSubmitting(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }

    setSession(result);
  }

  async function handleIvePaid() {
    if (!session) return;
    setConfirming(true);
    const result = await confirmManualPayment(session.orderId);
    setConfirming(false);

    if (!result.ok) {
      setError(result.error);
      return;
    }

    clear();
    router.push(`/order/${session.orderId}/confirmation`);
  }

  if (lines.length === 0 && !session) {
    return (
      <section className="py-20 md:py-32">
        <Container className="mx-auto max-w-xl text-center">
          <p className="text-sm text-charcoal">Your cart is empty. Redirecting…</p>
        </Container>
      </section>
    );
  }

  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-xl">
        <h1 className="text-3xl tracking-tight text-ink md:text-4xl">
          {session ? "Complete your payment." : "Checkout."}
        </h1>

        <div className="mt-8 border-t border-line pt-6">
          <h2 className="text-sm font-medium text-ink">Order summary</h2>
          <div className="mt-4 divide-y divide-line">
            {lines.map((line) => (
              <div key={line.id} className="flex items-baseline justify-between gap-4 py-3">
                <span className="text-sm text-charcoal">
                  {line.name} × {line.qty}
                </span>
                <span className="text-sm text-ink">
                  <Amount
                    thb={line.unitPriceThb * line.qty}
                    usd={unitUsd(line.id) != null ? unitUsd(line.id)! * line.qty : null}
                  />
                </span>
              </div>
            ))}
          </div>
          <div className="mt-4 flex items-baseline justify-between border-t border-line pt-4">
            <span className="text-sm text-ink">Total</span>
            <span className="text-base text-ink">
              <Amount thb={subtotalThb} usd={subtotalUsd} />
            </span>
          </div>
        </div>

        {error && <p className="mt-6 text-sm text-brass">{error}</p>}

        {!session ? (
          <form onSubmit={handleDetailsSubmit} className="mt-10 space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Name" name="name" required />
              <Field label="Company" name="company" />
            </div>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
              <Field label="Email" name="email" type="email" required />
              <Field label="Phone" name="phone" type="tel" required />
            </div>
            <div>
              <label htmlFor="preferredLanguage" className="text-sm text-ink">
                Preferred language
              </label>
              <select
                id="preferredLanguage"
                name="preferredLanguage"
                defaultValue="EN"
                className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brass"
              >
                <option value="EN">English</option>
                <option value="TH">Thai</option>
              </select>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper disabled:opacity-60"
            >
              {submitting ? "Processing…" : "Continue to Payment"}
            </button>
          </form>
        ) : (
          <div className="mt-10 border-t border-line pt-8">
            <p className="text-sm leading-relaxed text-charcoal">
              Transfer the total above via PromptPay or bank transfer, then
              confirm below. We&rsquo;ll verify the transfer and follow up
              directly.
            </p>

            <div className="mt-6 flex aspect-square w-40 items-center justify-center border border-dashed border-line text-center text-xs text-charcoal/60">
              PromptPay QR
              <br />
              placeholder
            </div>

            <dl className="mt-6 space-y-2 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal">PromptPay ID</dt>
                <dd className="text-ink">{session.payment.promptPayId}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal">Bank</dt>
                <dd className="text-ink">{session.payment.bankName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal">Account name</dt>
                <dd className="text-ink">{session.payment.bankAccountName}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-charcoal">Account number</dt>
                <dd className="text-ink">{session.payment.bankAccountNumber}</dd>
              </div>
            </dl>

            <button
              type="button"
              onClick={handleIvePaid}
              disabled={confirming}
              className="mt-8 border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper disabled:opacity-60"
            >
              {confirming ? "Confirming…" : "I've Paid"}
            </button>
          </div>
        )}

        <Link href="/cart" className="mt-8 block text-sm text-charcoal hover:text-ink">
          ← Back to cart
        </Link>
      </Container>
    </section>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="text-sm text-ink">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brass"
      />
    </div>
  );
}
