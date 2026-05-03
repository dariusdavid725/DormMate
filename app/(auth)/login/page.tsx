import type { Metadata } from "next";

import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  robots: "noindex, nofollow",
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const q = await searchParams;
  const nextHref =
    typeof q.next === "string" && q.next.startsWith("/") && !q.next.startsWith("//")
      ? q.next
      : "/dashboard";
  const urlError =
    typeof q.error === "string" ? decodeURIComponent(q.error) : undefined;

  return (
    <>
      <div className="mb-7 text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.32em] text-dm-electric">
          Lobby check-in
        </p>
        <h1 className="mt-2 text-3xl font-black tracking-tight text-dm-text">
          Back in your flat HQ
        </h1>
        <p className="mt-2 text-sm font-medium leading-relaxed text-dm-muted">
          Chores queued, receipts snoozed — dive back in whenever adulting pings you.
        </p>
      </div>
      <div className="dm-card-surface dm-fade-in-up rounded-[1.35rem] p-8 shadow-[0_30px_80px_-52px_var(--dm-electric-glow)] lg:p-10">
        <LoginForm nextHref={nextHref} urlError={urlError} />
      </div>
      <p className="mt-7 text-center text-sm text-dm-muted">
        New roommate energy?{" "}
        <Link
          href="/signup"
          className="font-bold text-dm-electric underline decoration-dm-electric/35 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40"
        >
          Spawn an account
        </Link>
      </p>
    </>
  );
}
