import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { JoinHouseholdForm } from "@/components/household/join-household-form";
import { joinHouseholdByInviteCodeCore } from "@/lib/households/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Join household",
};

type Props = {
  searchParams: Promise<{ code?: string; auto?: string }>;
};

export default async function JoinHouseholdPage({ searchParams }: Props) {
  const q = await searchParams;
  const code = typeof q.code === "string" ? q.code : undefined;
  const auto = q.auto !== "0";
  let autoError: string | null = null;

  if (code && auto) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const joined = await joinHouseholdByInviteCodeCore(code);
      if (joined.ok) {
        const { householdId, householdName, joined: isNewMember } = joined.result;
        const welcome = encodeURIComponent(`Welcome to ${householdName}!`);
        redirect(
          `/dashboard/household/${householdId}?welcome=${welcome}&joined=${isNewMember ? "1" : "0"}`,
        );
      } else {
        autoError = joined.error;
      }
    }
  }

  return (
    <div className="mx-auto max-w-md space-y-7 pb-24 max-lg:px-0 lg:space-y-8 lg:pb-12">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-5 lg:pb-6">
        <h1 className="font-cozy-display text-[2.2rem] leading-[1.05] text-dm-text max-lg:tracking-tight lg:text-[2.85rem] lg:leading-none">
          Pin your key
        </h1>
        <p className="mt-3 hidden text-[14px] leading-snug text-dm-muted lg:block lg:text-[13px] lg:leading-relaxed">
          Drop in the invite your roommate pasted. If you landed here logged out,
          you&apos;ll bounce through sign-in once, then circle back via the hallway.
        </p>
        <p className="mt-3 text-[14px] leading-snug text-dm-muted lg:hidden">
          Paste the invite code from your roommate.
        </p>
      </header>

      <div className="cozy-poster cozy-tilt-xs p-5 shadow-[var(--cozy-shadow-paper)] max-lg:rounded-2xl lg:p-6">
        {autoError ? (
          <p
            role="alert"
            className="mb-4 rounded-md border border-dm-danger/40 bg-dm-surface px-3 py-2 text-sm text-dm-danger"
          >
            {autoError}
          </p>
        ) : null}
        <JoinHouseholdForm initialCode={code} />
        <p className="mt-6 text-center text-[12px] text-dm-muted">
          Need keys first?{" "}
          <Link
            className="font-semibold text-dm-electric hover:underline"
            href={`/signup?next=${encodeURIComponent(`/dashboard/join?code=${encodeURIComponent(code ?? "")}`)}`}
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
