"use client";

import { useState, type FormEvent } from "react";
import { submitQuoteRequest } from "./actions";

export default function QuoteRequestForm({
  itemId,
  itemName,
}: {
  itemId: string | null;
  itemName: string | null;
}) {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(e.currentTarget);
    const result = await submitQuoteRequest({
      itemId,
      itemName,
      name: String(form.get("name") ?? ""),
      company: String(form.get("company") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      message: String(form.get("message") ?? ""),
    });

    if (!result.ok) {
      setError(result.error);
      setStatus("idle");
      return;
    }
    setStatus("sent");
  }

  if (status === "sent") {
    return (
      <div className="border border-line px-8 py-14 text-center">
        <p className="text-lg text-ink">
          Thank you. We&rsquo;ll follow up with a quote within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {itemName && (
        <p className="border border-line px-4 py-3 text-sm text-charcoal">
          Requesting a quote for <span className="text-ink">{itemName}</span>.
        </p>
      )}

      {error && <p className="text-sm text-brass">{error}</p>}

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Company" name="company" />
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" required />
      </div>
      <div>
        <label htmlFor="message" className="text-sm text-ink">
          Tell us about the scope
        </label>
        <textarea
          id="message"
          name="message"
          rows={5}
          className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brass"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Request a Quote"}
      </button>
    </form>
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
