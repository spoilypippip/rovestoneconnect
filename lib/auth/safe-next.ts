// Where to send someone when the requested destination can't be trusted.
const FALLBACK = "/";

/**
 * Narrows an attacker-controllable `next` value down to a path on this
 * site. Anything else - an absolute URL, a protocol-relative "//evil.com",
 * a "/\evil.com" (which browsers also treat as protocol-relative) - becomes
 * "/" rather than an open redirect out of the sign-in flow.
 *
 * Every place that reads a `next` (login, register, the OAuth/email
 * callback, the proxy's redirect) must run the value through this before
 * navigating to it, including values we generated ourselves: they make the
 * round trip through a URL the user can edit.
 */
export function safeNext(value: string | null | undefined): string {
  if (!value) return FALLBACK;
  if (!value.startsWith("/")) return FALLBACK;
  if (value.startsWith("//") || value.startsWith("/\\")) return FALLBACK;
  // Control characters (newlines, tabs, NULs) are stripped or normalised by
  // browsers, which can turn an apparently-relative path into something
  // else entirely.
  if (/[\u0000-\u001F\u007F]/.test(value)) return FALLBACK;
  return value;
}
