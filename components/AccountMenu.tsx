"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { useAuth } from "./AuthProvider";
import { signOut } from "@/app/auth/actions";
import { useClickOutside } from "@/lib/hooks/useClickOutside";
import { UserIcon, ChevronDownIcon } from "./icons";

export default function AccountMenu() {
  const { user, loading } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useClickOutside(containerRef, () => setOpen(false), open);

  if (loading) {
    return <span className="h-8 w-8" aria-hidden />;
  }

  if (!user) {
    return (
      <Link
        href="/login"
        className="flex items-center gap-1.5 text-sm text-charcoal transition-colors hover:text-ink"
      >
        <UserIcon className="h-4 w-4" />
        Sign in
      </Link>
    );
  }

  const firstName = (user.user_metadata?.first_name as string | undefined) ?? user.email ?? "";
  const avatarUrl = user.user_metadata?.avatar_url as string | undefined;
  const initial = firstName.charAt(0).toUpperCase();

  async function handleSignOut() {
    await signOut();
    // Hard reload so the client-side auth context (and cart, which keys off
    // the signed-in user) picks up the now-cleared session immediately.
    window.location.href = "/";
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex items-center gap-2 text-sm text-charcoal transition-colors hover:text-ink"
      >
        {avatarUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={avatarUrl} alt="" className="h-7 w-7 rounded-full object-cover" />
        ) : (
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-ink text-xs text-paper">
            {initial}
          </span>
        )}
        <span className="hidden sm:inline">{firstName}</span>
        <ChevronDownIcon className={`h-3.5 w-3.5 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full mt-2 min-w-[10rem] border border-line bg-paper py-1 shadow-sm"
        >
          <button
            type="button"
            role="menuitem"
            onClick={handleSignOut}
            className="block w-full px-4 py-2 text-left text-sm text-charcoal transition-colors hover:bg-line/40 hover:text-ink"
          >
            Log out
          </button>
        </div>
      )}
    </div>
  );
}
