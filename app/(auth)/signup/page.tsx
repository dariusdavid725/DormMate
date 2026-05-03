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
        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-dm-accent">
          New flat lease (digital edition)
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-dm-text">
          Claim your DormMate key
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-dm-muted">
          Pull roomies in once you&apos;re parked on the dashboard.
        </p>
      </div>
      <div className="dm-card-surface dm-fade-in-up rounded-[1.35rem] p-8 lg:p-10">
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
