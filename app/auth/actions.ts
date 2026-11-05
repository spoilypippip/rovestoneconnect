"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isPasswordValid, PASSWORD_REQUIREMENTS_MESSAGE } from "@/lib/auth/validate-password";
import { safeNext } from "@/lib/auth/safe-next";

function siteUrl(): string {
  if (process.env.SITE_URL) return process.env.SITE_URL;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

/**
 * Where to send the browser once this round trip through Google / an email
 * confirmation link comes back. Always narrowed with safeNext: it reaches
 * us from a query string or a form field, both of which the user controls.
 */
function callbackUrl(next: string | null | undefined): string {
  return `${siteUrl()}/auth/callback?next=${encodeURIComponent(safeNext(next))}`;
}

export type AuthActionResult =
  | { ok: true; needsEmailConfirmation: false }
  | { ok: true; needsEmailConfirmation: true }
  | { ok: false; error: string };

export async function signInWithPassword(email: string, password: string): Promise<AuthActionResult> {
  if (!email.trim() || !password) {
    return { ok: false, error: "Email and password are required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });

  if (error) {
    return { ok: false, error: "Incorrect email or password." };
  }

  return { ok: true, needsEmailConfirmation: false };
}

export async function signUpWithPassword(input: {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
  next?: string;
}): Promise<AuthActionResult> {
  const firstName = input.firstName.trim();
  const lastName = input.lastName.trim();
  const email = input.email.trim();

  if (!firstName || !lastName || !email) {
    return { ok: false, error: "First name, last name, and email are required." };
  }
  if (input.password !== input.confirmPassword) {
    return { ok: false, error: "Passwords do not match." };
  }
  if (!isPasswordValid(input.password)) {
    return { ok: false, error: PASSWORD_REQUIREMENTS_MESSAGE };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password: input.password,
    options: {
      data: { first_name: firstName, last_name: lastName },
      emailRedirectTo: callbackUrl(input.next),
    },
  });

  if (error) {
    return { ok: false, error: error.message };
  }

  return { ok: true, needsEmailConfirmation: !data.session };
}

// Used as a <form action>, so the `next` the user should land on travels in
// a hidden field rather than an argument.
export async function signInWithGoogle(formData: FormData): Promise<void> {
  const next = safeNext(String(formData.get("next") ?? ""));

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: callbackUrl(next) },
  });

  if (error || !data.url) {
    redirect(`/login?error=google-unavailable&next=${encodeURIComponent(next)}`);
  }

  redirect(data.url);
}

export async function signOut(): Promise<{ ok: true }> {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return { ok: true };
}
