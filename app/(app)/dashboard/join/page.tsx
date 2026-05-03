import type { Metadata } from "next";
import Link from "next/link";

import { JoinHouseholdForm } from "@/components/household/join-household-form";

export const metadata: Metadata = {
  title: "Join household",
};

type Props = {
  searchParams: Promise<{ code?: string }>;
};

export default async function JoinHouseholdPage({ searchParams }: Props) {
  const q = await searchParams;
  const code = typeof q.code === "string" ? q.code : undefined;

  return (
    <div className="mx-auto max-w-md space-y-8 pb-24 lg:pb-12">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-6">
        <h1 className="font-cozy-display text-[2.85rem] leading-[1] text-dm-text">
          Pin your key
        </h1>
        <p className="mt-3 text-[13px] leading-relaxed text-dm-muted">
          Drop in the invite your roommate pasted. If you landed here logged out,
          you&apos;ll bounce through sign-in once, then circle back via the hallway.
        </p>
      </header>

      <div className="cozy-poster cozy-tilt-xs p-6 shadow-[var(--cozy-shadow-paper)]">
        <JoinHouseholdForm initialCode={code} />
        <p className="mt-6 text-center text-[12px] text-dm-muted">
          Need keys first?{" "}
          <Link className="font-semibold text-dm-electric hover:underline" href="/signup">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
