import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContextualActionChip } from "@/components/dashboard/contextual-action-chip";
import { DashboardFeed } from "@/components/dashboard/dashboard-feed";
import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { DormStatusRing } from "@/components/dashboard/dorm-status-ring";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { loadReceiptFeedPreview } from "@/lib/receipts/feed-queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pulse",
};

function formatEuro(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `€${n.toFixed(2)}`;
  }
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { households, error } = await loadHouseholdSummaries(user.id);
  const primaryId = households[0]?.id ?? null;
  const { items: receiptFeed, error: feedErr } = await loadReceiptFeedPreview(
    households,
  );

  const realReceiptCount = receiptFeed.length;
  const firstHhReceipts = primaryId
    ? receiptFeed.filter((x) => x.householdId === primaryId).length
    : 0;

  const scanHref = primaryId
    ? `/dashboard/household/${primaryId}?view=receipts`
    : null;

  const owedPreview = formatEuro(0);

  const ringFilled = households.length > 0 ? Math.min(households.length, 4) : 0;
  const ringTotal = households.length > 0 ? 4 : 1;
  const ringSubtitle =
    households.length === 0
      ? "add a dorm first"
      : `${households.length} household${households.length === 1 ? "" : "s"} linked`;

  return (
    <div className="mx-auto w-full max-w-lg pb-[7.5rem] lg:max-w-6xl lg:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 lg:max-w-none">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-dm-muted">
            Today in your dorm
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-dm-text">
            Pulse
          </h1>
        </div>
        <DormStatusRing
          filled={ringFilled}
          total={ringTotal}
          subtitle={ringSubtitle}
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-8 rounded-2xl border border-dm-danger/35 bg-red-500/[0.06] px-4 py-3 text-sm text-dm-danger"
        >
          <p className="font-semibold">Couldn&apos;t sync households</p>
          <p className="mt-1 opacity-90">
            {shouldExposeSupabaseError() ? error : PUBLIC_TRY_AGAIN}
          </p>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-14 xl:flex-row xl:gap-16">
        <div className="min-w-0 flex-1 space-y-14">
          <section
            aria-labelledby="pulse-money"
            className="relative overflow-hidden rounded-3xl border border-[var(--dm-border-strong)] bg-gradient-to-b from-dm-surface to-dm-surface/45 p-6 shadow-xl shadow-black/[0.035] lg:p-10"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-24 h-64 w-64 rounded-full bg-[var(--dm-electric-glow)] blur-3xl"
            />
            <p
              id="pulse-money"
              className="relative text-xs font-semibold uppercase tracking-wider text-dm-muted"
            >
              Balance preview
            </p>
            <div className="relative mt-8 flex flex-col gap-10 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-medium text-dm-muted">
                  You are owed
                </p>
                <p className="mt-2 font-mono text-[clamp(2.5rem,8vw,3.55rem)] font-semibold tracking-tighter text-[var(--dm-accent)] tabular-nums">
                  {owedPreview}
                </p>
                <p className="mt-3 max-w-[22rem] text-sm leading-relaxed text-dm-muted">
                  Receipts sync into the feed. When attribution ships, owes flip
                  to calmer reds here — owed states stay mint-forward.
                </p>
              </div>
              <div className="flex flex-col items-stretch gap-4 lg:max-w-[15rem]">
                <ContextualActionChip
                  householdsCount={households.length}
                  receiptsCountAllTime={realReceiptCount}
                  primaryHouseholdHasReceipts={firstHhReceipts > 0}
                  scanReceiptHref={scanHref}
                  createHouseholdHint={households.length === 0}
                />
                {scanHref ? (
                  <Link
                    href={scanHref}
                    className="inline-flex justify-center rounded-full bg-[var(--dm-accent)] px-8 py-3.5 text-center text-sm font-semibold text-[var(--dm-accent-ink)] shadow-lg shadow-teal-900/10 transition hover:brightness-105 active:scale-[0.99]"
                  >
                    Scan receipt · AI
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-full border border-[var(--dm-border-strong)] px-8 py-3.5 text-center text-sm font-medium text-dm-muted/70"
                  >
                    Pick a dorm to scan into
                  </button>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="activity-feed">
            <div className="flex flex-wrap items-end justify-between gap-3 pb-5">
              <div>
                <h2
                  id="activity-feed"
                  className="text-lg font-semibold tracking-tight text-dm-text"
                >
                  Activity
                </h2>
                <p className="mt-1 text-sm text-dm-muted">
                  Latest receipts mixed with roadmap notes.
                </p>
              </div>
              {feedErr ? (
                <span className="rounded-full bg-dm-danger/10 px-3 py-1 text-xs font-semibold text-dm-danger">
                  Feed partial
                </span>
              ) : null}
            </div>
            <DashboardFeed receipts={receiptFeed} />
          </section>
        </div>

        <aside className="w-full shrink-0 space-y-6 xl:w-[min(100%,21rem)]">
          <div
            id="create-household"
            className="scroll-mt-28 rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/72 p-6 shadow-lg shadow-black/[0.04] backdrop-blur-md lg:p-8"
          >
            <h3 className="text-sm font-semibold text-dm-text">
              Create a household
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-dm-muted">
              One cockpit for groceries, slips, chores — teammates join when invites land.
            </p>
            <CreateHouseholdForm className="mt-5 space-y-4" />
          </div>

          {households.length > 0 ? (
            <div className="rounded-3xl border border-[var(--dm-border)] bg-dm-surface/50 p-5 backdrop-blur-sm">
              <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
                Your spaces
              </p>
              <ul className="mt-4 space-y-2">
                {households.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/dashboard/household/${h.id}`}
                      className="flex items-center justify-between gap-4 rounded-xl border border-transparent px-4 py-3 transition hover:border-[var(--dm-border-strong)] hover:bg-dm-surface"
                    >
                      <span className="truncate font-medium text-dm-text">
                        {h.name}
                      </span>
                      <span className="shrink-0 rounded-full bg-[var(--dm-accent-soft)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-dm-accent-ink">
                        {h.role}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
