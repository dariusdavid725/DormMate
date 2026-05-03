import type { Metadata } from "next";

import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  robots: "noindex, nofollow",
};

export default function SignupPage() {
  return (
    <>
      <div className="mb-7 text-center">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dm-muted">
          Fresh term
        </p>
        <h1 className="font-cozy-display mt-2 text-4xl tracking-tight text-dm-text sm:text-[2.75rem]">
          Pin up your dorm board
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-dm-muted">
          Invite flatmates once you land on Home.
        </p>
      </div>
      <div className="cozy-note cozy-drop-in dm-fade-in-up p-8 shadow-[var(--cozy-shadow-note)] lg:p-10">
        <SignupForm />
      </div>
      <p className="mt-7 text-center text-sm text-dm-muted">
        <Link
          href="/login"
          className="font-bold text-dm-electric underline decoration-dm-electric/35 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40"
        >
          Already rolling with us? Log in
        </Link>
      </p>
    </>
  );
}
