"use client";

import { useState, type FormEvent } from "react";
import { signInWithPassword, signInWithGoogle } from "@/app/auth/actions";

export default function LoginForm() {
  const [status, setStatus] = useState<"idle" | "submitting">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = new FormData(event.currentTarget);
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");

    const result = await signInWithPassword(email, password);
    if (!result.ok) {
      setError(result.error);
      setStatus("idle");
      return;
    }

    // Hard reload so the client-side auth context (and cart, which keys off
    // the signed-in user) picks up the new session immediately.
    window.location.href = "/";
  }

  return (
    <div className="space-y-6">
      <form action={signInWithGoogle}>
        <button
          type="submit"
          className="w-full border border-line px-6 py-3 text-sm text-ink transition-colors hover:border-brass"
        >
          Continue with Google
        </button>
      </form>

      <div className="flex items-center gap-4 text-xs uppercase tracking-[0.12em] text-charcoal">
        <span className="h-px flex-1 bg-line" />
        or
        <span className="h-px flex-1 bg-line" />
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />

        {error && <p className="text-sm text-brass">{error}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper disabled:opacity-60"
        >
          {status === "submitting" ? "Signing in…" : "Sign in"}
        </button>
      </form>
    </div>
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
