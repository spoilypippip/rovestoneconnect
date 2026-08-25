"use client";

import { useState, type FormEvent } from "react";
import { catalog } from "@/content/catalog";

export default function ContactForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "sent">("idle");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    // UI-only submission for this deliverable: wire to a backend or
    // email endpoint before launch.
    window.setTimeout(() => setStatus("sent"), 500);
  }

  if (status === "sent") {
    return (
      <div className="border border-line px-8 py-14 text-center">
        <p className="text-lg text-ink">
          Thank you. We&rsquo;ll respond within one business day.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6" noValidate={false}>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Name" name="name" required />
        <Field label="Company" name="company" />
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <Field label="Email" name="email" type="email" required />
        <Field label="Phone" name="phone" type="tel" />
      </div>

      <div>
        <label htmlFor="service" className="text-sm text-ink">
          Which service are you interested in?
        </label>
        <select
          id="service"
          name="service"
          className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brass"
        >
          <option value="">Select a service</option>
          {catalog.categories.map((category) => (
            <option key={category.slug} value={category.slug}>
              {category.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="message" className="text-sm text-ink">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          className="mt-2 w-full border border-line bg-paper px-4 py-3 text-sm text-ink focus-visible:outline-2 focus-visible:outline-brass"
        />
      </div>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper disabled:opacity-60"
      >
        {status === "submitting" ? "Sending…" : "Request a Consultation"}
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
