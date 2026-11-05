import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { safeNext } from "@/lib/auth/safe-next";

// Routes that only make sense for someone who can actually buy. Checked
// here as well as in the Server Actions themselves - this is the redirect
// that makes the app usable, the action-level check is what makes it safe.
//
// Deliberately NOT listed: /order/[id]/confirmation (Stripe redirects
// straight back to it, and the order id is the only thing needed to read
// it) and /api/webhooks/stripe (Stripe authenticates with a signature, not
// a session - a redirect there would break payment confirmation entirely).
const SIGNED_IN_ONLY_PATHS = ["/cart", "/checkout"];

function requiresSignIn(pathname: string): boolean {
  return SIGNED_IN_ONLY_PATHS.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
}

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    },
  );

  // Refreshes the auth token if needed - required for `getUser()` calls
  // elsewhere (Server Actions, the OAuth callback route) to see a valid
  // session on every request.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { pathname, search } = request.nextUrl;
  if (!user && requiresSignIn(pathname)) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/login";
    loginUrl.search = "";
    loginUrl.searchParams.set("next", safeNext(`${pathname}${search}`));

    const redirectResponse = NextResponse.redirect(loginUrl);
    // Carry over any refreshed session cookies, which would otherwise be
    // dropped along with `response`.
    for (const cookie of response.cookies.getAll()) {
      redirectResponse.cookies.set(cookie);
    }
    return redirectResponse;
  }

  return response;
}
