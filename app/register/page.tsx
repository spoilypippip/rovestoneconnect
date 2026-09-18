import type { Metadata } from "next";
import Link from "next/link";
import Container from "@/components/Container";
import RegisterForm from "./RegisterForm";

export const metadata: Metadata = {
  title: "Create Account | RoveStone Connect",
};

export default function RegisterPage() {
  return (
    <section className="py-20 md:py-32">
      <Container className="mx-auto max-w-md">
        <p className="text-xs font-medium uppercase tracking-[0.12em] text-charcoal">
          Create Account
        </p>
        <h1 className="mt-5 text-3xl tracking-tight text-ink md:text-4xl">
          Join RoveStone Connect.
        </h1>

        <div className="mt-10">
          <RegisterForm />
        </div>

        <p className="mt-6 text-sm text-charcoal">
          Already have an account?{" "}
          <Link href="/login" className="text-ink underline underline-offset-2">
            Sign in
          </Link>
        </p>
      </Container>
    </section>
  );
}
