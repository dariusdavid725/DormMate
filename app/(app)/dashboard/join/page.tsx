import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileScrollViewport } from "@/components/mobile/mobile-scroll-viewport";
import { JoinHouseholdForm } from "@/components/household/join-household-form";
import { joinHouseholdByInviteCodeCore } from "@/lib/households/actions";
import { normalizeInviteCodeInput } from "@/lib/invites/normalize-invite-code";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Join home",
};

type Props = {
  searchParams: Promise<{ code?: string; auto?: string }>;
};

export default async function JoinHouseholdPage({ searchParams }: Props) {
  const q = await searchParams;
  const rawCode = typeof q.code === "string" ? q.code : undefined;
  const codeNorm = rawCode ? normalizeInviteCodeInput(rawCode) : "";
  const codeForJoin = codeNorm.length >= 4 ? codeNorm : null;
  const auto = q.auto !== "0";
  let autoError: string | null = null;

  if (codeForJoin && auto) {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      const joined = await joinHouseholdByInviteCodeCore(codeForJoin);
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
    <div className="mx-auto flex min-h-0 w-full max-w-md flex-1 flex-col overflow-hidden lg:block lg:flex-none lg:space-y-8 lg:overflow-visible lg:pb-12">
      <header className="shrink-0 border-b border-dashed border-[var(--dm-border-strong)] pb-3 pt-0.5 lg:pb-6 lg:pt-0">
        <h1 className="font-cozy-display text-[1.42rem] leading-[1.08] tracking-tight text-dm-text lg:text-[2.85rem] lg:leading-none lg:tracking-normal">
          Join this Koti home
        </h1>
        <p className="mt-1 line-clamp-2 text-[11px] leading-snug text-dm-muted lg:hidden">
          Paste the invite code from your roommate.
        </p>
        <p className="mt-3 hidden text-[14px] leading-snug text-dm-muted lg:block lg:text-[13px] lg:leading-relaxed">
          You&apos;ve been invited to join a home on Koti. Paste your code and we&apos;ll get
          you into the right board.
        </p>
      </header>

      <MobileScrollViewport className="flex flex-col px-0 pb-4 pt-3 lg:flex-none lg:contents lg:p-0">
        <div className="cozy-poster cozy-tilt-xs min-w-0 p-4 shadow-[var(--cozy-shadow-paper)] max-lg:rounded-2xl lg:p-6">
          {autoError ? (
            <p
              role="alert"
              className="mb-4 min-w-0 rounded-md border border-dm-danger/40 bg-dm-surface px-3 py-2 text-[13px] leading-snug text-dm-danger"
            >
              {autoError}
            </p>
          ) : null}
          <JoinHouseholdForm initialCode={rawCode?.trim() ?? ""} />
          <p className="mt-6 text-center text-[12px] text-dm-muted">
            Already have an account?{" "}
            <Link
              className="touch-manipulation px-2 py-2 font-semibold text-dm-electric underline underline-offset-[0.22em] hover:opacity-90"
              href={`/login?next=${encodeURIComponent(
                `/dashboard/join${codeForJoin ? `?code=${encodeURIComponent(codeForJoin)}` : ""}`,
              )}`}
            >
              Log in
            </Link>
          </p>
          <p className="mt-4 text-center text-[12px] text-dm-muted">
            Need keys first?{" "}
            <Link
              className="touch-manipulation px-2 py-2 font-semibold text-dm-electric underline underline-offset-[0.22em] hover:opacity-90"
              href={`/signup?next=${encodeURIComponent(
                `/dashboard/join${codeForJoin ? `?code=${encodeURIComponent(codeForJoin)}` : ""}`,
              )}`}
            >
              Sign up
            </Link>
          </p>
        </div>
      </MobileScrollViewport>
    </div>
  );
}
