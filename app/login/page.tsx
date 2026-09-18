import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign In | RoveStone Connect",
};

export default function LoginPage() {
  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-charcoal">
          Sign In
        </p>
        <h1 className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
          Welcome back.
        </h1>

        <div className="mt-10">
          <LoginForm />
        </div>

        <p className="mt-6 text-sm text-charcoal">
          Don&rsquo;t have an account?{" "}
          <Link href="/register" className="text-ink underline underline-offset-2">
            Create one
          </Link>
        </p>
      </Container>
    </section>
  );
}
