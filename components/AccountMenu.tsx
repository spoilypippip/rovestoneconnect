"use client";

import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { signOut } from "@/app/auth/actions";

export default function AccountMenu() {
  const { user, loading } = useAuth();

  if (loading) {
    return <span className="text-sm text-charcoal">&nbsp;</span>;
  }

  if (!user) {
    return (
      <Link href="/login" className="text-sm text-charcoal transition-colors hover:text-ink">
        Sign in
      </Link>
    );
  }

  const firstName = (user.user_metadata?.first_name as string | undefined) ?? user.email;

  async function handleSignOut() {
    await signOut();
    // Hard reload so the client-side auth context (and cart, which keys off
    // the signed-in user) picks up the now-cleared session immediately.
    window.location.href = "/";
  }

  return (
    <div className="flex items-center gap-3">
      <span className="hidden text-sm text-charcoal sm:inline">Hi, {firstName}</span>
      <button
        type="button"
        onClick={handleSignOut}
        className="text-sm text-charcoal transition-colors hover:text-ink"
      >
        Log out
      </button>
    </div>
  );
}
