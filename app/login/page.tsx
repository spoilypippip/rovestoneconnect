import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import LoginForm from "./LoginForm";
import { safeNext } from "@/lib/auth/safe-next";

export const metadata: Metadata = {
  title: "Sign In | RoveStone Connect",
};

// True when the destination we'll return to is an add-to-cart handoff, so
// the page can say why signing in was asked for.
function isCartHandoff(next: string): boolean {
  const queryStart = next.indexOf("?");
  if (queryStart === -1) return false;
  return new URLSearchParams(next.slice(queryStart + 1)).has("add");
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string | string[] }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = safeNext(Array.isArray(rawNext) ? rawNext[0] : rawNext);

  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-charcoal">
          Sign In
        </p>
        <h1 className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
          Welcome back.
        </h1>
        {isCartHandoff(next) && (
          <p className="mt-4 text-sm leading-relaxed text-charcoal">
            Sign in to add this service to your cart.
          </p>
        )}

        <div className="mt-10">
          <LoginForm next={next} />
        </div>

        <p className="mt-6 text-sm text-charcoal">
          Don&rsquo;t have an account?{" "}
          <Link
            href={`/register?next=${encodeURIComponent(next)}`}
            className="text-ink underline underline-offset-2"
          >
            Create one
          </Link>
        </p>
      </Container>
    </section>
  );
}
