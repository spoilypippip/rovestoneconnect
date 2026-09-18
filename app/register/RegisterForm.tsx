"use client";

import { useState, type FormEvent } from "react";
import { signUpWithPassword, signInWithGoogle } from "@/app/auth/actions";
import { isPasswordValid, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/auth/validate-password";

export default function RegisterForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "check-email">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const form = new FormData(event.currentTarget);
    const firstName = String(form.get("firstName") ?? "");
    const lastName = String(form.get("lastName") ?? "");
    const email = String(form.get("email") ?? "");
    const password = String(form.get("password") ?? "");
    const confirmPassword = String(form.get("confirmPassword") ?? "");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!isPasswordValid(password)) {
      setError(PASSWORD_REQUIREMENTS_MESSAGE);
      return;
    }

    setStatus("submitting");
    const result = await signUpWithPassword({ firstName, lastName, email, password, confirmPassword });
    if (!result.ok) {
      setError(result.error);
      setStatus("idle");
      return;
    }

    if (result.needsEmailConfirmation) {
      setStatus("check-email");
      return;
    }

    // Hard reload so the client-side auth context (and cart, which keys off
    // the signed-in user) picks up the new session immediately.
    window.location.href = "/";
  }

  if (status === "check-email") {
    return (
      <div className="border border-line px-8 py-14 text-center">
        <p className="text-lg text-ink">
          Almost there - check your email to confirm your account.
        </p>
      </div>
    );
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
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field label="First name" name="firstName" required />
          <Field label="Last name" name="lastName" required />
        </div>

        <Field label="Email" name="email" type="email" required />
        <Field label="Password" name="password" type="password" required />
        <Field label="Confirm password" name="confirmPassword" type="password" required />
        <p className="text-xs text-charcoal">{PASSWORD_REQUIREMENTS_MESSAGE}</p>

        {error && <p className="text-sm text-brass">{error}</p>}

        <button
          type="submit"
          disabled={status === "submitting"}
          className="border border-brass px-6 py-3 text-sm text-ink transition-colors hover:bg-brass hover:text-paper disabled:opacity-60"
        >
          {status === "submitting" ? "Creating account…" : "Create account"}
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
