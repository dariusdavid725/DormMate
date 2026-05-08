import Link from "next/link";

import { PwaInstallMarketingMobile } from "@/components/pwa/pwa-install-cta";

/** Full-viewport mobile app gate for "/". Desktop uses the usual marketing hero. */
export function KotiMobileEntry() {
  return (
    <div className="relative flex max-h-[100svh] min-h-[100svh] min-h-0 flex-1 flex-col overflow-hidden bg-[linear-gradient(168deg,color-mix(in_srgb,var(--dm-social)_6%,var(--dm-bg))_0%,var(--dm-bg)_38%,color-mix(in_srgb,var(--dm-accent-soft)_72%,white)_105%)] pt-[env(safe-area-inset-top)] lg:hidden">
      <div className="dm-koti-entry-animate flex shrink-0 flex-col items-center gap-3 px-5 pb-5 pt-[max(0.25rem,calc(env(safe-area-inset-top)*0))]">
        <Link href="/" className="inline-flex shrink-0 items-center gap-2 rounded-2xl py-2" aria-current="page">
          {/* eslint-disable-next-line @next/next/no-img-element -- static logo */}
          <img src="/logo.png" alt="" className="h-11 w-11 rounded-xl object-cover shadow-[0_10px_24px_rgba(28,39,56,0.14)]" width={44} height={44} />
          <span className="font-cozy-display text-[1.6rem] font-semibold text-dm-text">Koti</span>
        </Link>
        <div className="max-w-[20rem] text-center">
          <p className="text-[15px] font-semibold tracking-tight text-dm-text">Your shared home, organized.</p>
          <p className="mt-2 inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--dm-accent)_28%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-accent)_12%,white)] px-3 py-1 text-[10px] font-bold uppercase tracking-wide text-[var(--dm-accent-ink)]">
            for roommates &amp; shared apartments
          </p>
        </div>
      </div>

      {/* Preview stack */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center px-6 py-4">
        <div className="pointer-events-none relative h-[220px] w-[min(92vw,20rem)]" aria-hidden>
          <span className="absolute inset-[12%_-6%_-4%_-6%] rounded-[34px] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dm-text)_6%,transparent),transparent)] opacity-65 blur-xl" />
          <div className="dm-koti-card-a absolute left-[-4%] top-[26%] w-[72%] rotate-[-6deg] rounded-2xl border border-[color-mix(in_srgb,var(--dm-success)_38%,var(--dm-border-strong))] bg-[linear-gradient(148deg,color-mix(in_srgb,var(--dm-success)_10%,white),white)] px-3 py-3 shadow-[0_16px_32px_rgba(28,39,56,0.13)]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-dm-muted">Chores</p>
            <p className="mt-1 truncate text-[13px] font-semibold text-dm-text">Trash · dishes</p>
            <span className="mt-2 inline-flex h-5 min-w-[1.75rem] items-center rounded-md bg-[color-mix(in_srgb,var(--dm-success)_16%,white)] px-2 text-[10px] font-bold text-[color-mix(in_srgb,var(--dm-success)_95%,black)]">
              +10 pts
            </span>
          </div>
          <div className="dm-koti-card-b absolute right-[-10%] top-[6%] w-[78%] rotate-[9deg] rounded-2xl border border-[color-mix(in_srgb,var(--dm-highlight)_52%,var(--dm-border-strong))] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--dm-highlight)_16%,white),#fffefb)] px-3 py-3 shadow-[0_18px_36px_rgba(28,39,56,0.12)]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-dm-muted">Receipts</p>
            <p className="mt-1 font-mono text-[12px] font-semibold tabular-nums text-dm-text">€42.37</p>
          </div>
          <div className="dm-koti-card-c absolute bottom-[6%] left-[8%] w-[74%] rotate-[-4deg] rounded-2xl border border-[color-mix(in_srgb,var(--dm-info)_32%,var(--dm-border-strong))] bg-[linear-gradient(170deg,color-mix(in_srgb,var(--dm-info)_8%,white),white)] px-3 py-3 shadow-[0_16px_32px_rgba(28,39,56,0.13)]">
            <p className="text-[10px] font-bold uppercase tracking-wide text-dm-muted">Money</p>
            <p className="mt-1 line-clamp-2 break-words text-[12px] font-semibold text-dm-text">
              Weekend shop · evenly split
            </p>
          </div>
          <div className="dm-koti-card-d absolute bottom-[-2%] right-[4%] flex w-[64%] rotate-[4deg] items-center gap-2 rounded-2xl border border-[color-mix(in_srgb,var(--dm-accent)_30%,var(--dm-border-strong))] bg-white/93 px-3 py-2.5 shadow-[0_12px_28px_rgba(28,39,56,0.14)]">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dm-accent-soft)_92%,transparent)] text-sm font-bold text-[var(--dm-accent-ink)]">
              ◧
            </span>
            <div className="min-w-0">
              <p className="truncate text-[10px] font-bold uppercase tracking-wide text-dm-muted">Groceries</p>
              <p className="truncate text-[12px] font-semibold text-dm-text">8 items · you + 3</p>
            </div>
          </div>
        </div>
      </div>

      <div className="dm-koti-entry-animate shrink-0 space-y-4 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-5">
        <div className="text-center">
          <h2 className="text-[clamp(1.05rem,4.2vw,1.35rem)] font-bold leading-snug tracking-tight text-dm-text">
            Koti keeps shared living simple.
          </h2>
          <p className="mx-auto mt-2 max-w-[22rem] text-[13px] leading-snug text-dm-muted">
            Groceries, chores, receipts, expenses, and house updates — all in one shared home app.
          </p>
        </div>

        <PwaInstallMarketingMobile />

        <div className="mx-auto w-full max-w-sm space-y-3">
          <Link
            href="/signup"
            className="motion-reduce:transition-none dm-focus-ring flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-2xl bg-dm-electric px-5 text-[15px] font-bold text-white shadow-[0_14px_32px_rgba(200,104,69,0.28)] duration-150 active:scale-[0.985] motion-reduce:active:scale-100 sm:hover:brightness-105"
          >
            Get started
          </Link>
          <Link
            href="/login"
            className="dm-focus-ring flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-2xl border-2 border-[color-mix(in_srgb,var(--dm-social)_42%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-social)_10%,white)] px-5 text-[15px] font-bold text-[var(--dm-electric-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.75)] duration-150 active:scale-[0.988] motion-reduce:transition-none motion-reduce:active:scale-100"
          >
            Log in
          </Link>
          <p className="text-center text-[11px] font-medium leading-snug text-dm-muted">
            Create or join a home in seconds.
          </p>
        </div>

        <p className="pb-2 text-center text-[10px] text-dm-muted-soft">
          <Link className="font-semibold text-dm-electric underline underline-offset-2" href="/privacy">
            Privacy
          </Link>
          <span className="opacity-35"> · </span>
          <Link className="font-semibold text-dm-electric underline underline-offset-2" href="/terms">
            Terms
          </Link>
        </p>
      </div>
    </div>
  );
}
