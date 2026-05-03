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
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-dm-muted">
          Lobby check-in
        </p>
        <h1 className="font-cozy-display mt-2 text-4xl tracking-tight text-dm-text sm:text-[2.75rem]">
          Back on the corkboard
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-dm-muted">
          Stickies and receipt slips stay right where you left them.
        </p>
      </div>
      <div className="cozy-poster cozy-drop-in dm-fade-in-up p-8 shadow-[var(--cozy-shadow-paper)] lg:p-10">
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
