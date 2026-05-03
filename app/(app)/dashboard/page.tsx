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
import { loadOpenTasksForUser } from "@/lib/tasks/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
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
  const { tasks: openTasks, error: tasksErr } = await loadOpenTasksForUser(user.id);
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
        <div className="dm-construct-accent pl-1">
          <p className="inline-flex skew-x-[-8deg] bg-[color-mix(in_srgb,var(--dm-construct-yellow)_82%,transparent)] px-3 py-0.5 text-[11px] font-black uppercase tracking-[0.26em] text-[var(--dm-construct-ink)] dark:text-black">
            Dorm hub
          </p>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-dm-text">
            Home — chores & cash in one corridor
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
            aria-labelledby="open-chores"
            className="relative overflow-hidden rounded-sm border border-[var(--dm-border-strong)] bg-dm-surface/76 p-6 shadow-xl shadow-black/[0.04] backdrop-blur-md dm-construct-accent lg:p-9"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -left-24 bottom-[-20%] h-48 w-48 rotate-[18deg] bg-[var(--dm-construct-red)] opacity-[0.08] blur-3xl"
            />
            <div className="relative flex flex-wrap items-end justify-between gap-5">
              <div>
                <p
                  id="open-chores"
                  className="text-[11px] font-black uppercase tracking-[0.22em] text-[var(--dm-construct-red)] dark:text-orange-400"
                >
                  Chores on the magnet board
                </p>
                <p className="mt-4 text-sm leading-relaxed text-dm-muted">
                  Reward points stack on your roommate card when you knock something out — vibes, coffees, veto power on playlists.
                </p>
              </div>
              <Link
                href="/dashboard/tasks"
                className="dm-construct-angle inline-flex shrink-0 bg-black px-6 py-2.5 text-xs font-black uppercase tracking-[0.14em] text-white dark:bg-[var(--dm-construct-yellow)] dark:text-black"
              >
                All tasks →
              </Link>
            </div>
            {tasksErr ? (
              <p className="relative mt-4 text-sm font-medium text-amber-600 dark:text-amber-400">
                Chores unavailable until recent DB migration lands.
              </p>
            ) : openTasks.length === 0 ? (
              <p className="relative mt-8 text-[15px] font-medium text-dm-text">
                Queue is calm — toss the next tidy-up on Tasks.
              </p>
            ) : (
              <ul className="relative mt-7 space-y-3">
                {openTasks.slice(0, 4).map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--dm-border-strong)] bg-dm-bg/50 px-4 py-3 backdrop-blur-sm"
                  >
                    <div className="min-w-0">
                      <span className="inline-flex skew-x-[-6deg] bg-[var(--dm-construct-yellow)] px-1.5 py-px text-[10px] font-black text-black">
                        +{t.rewardPoints}
                      </span>
                      <span className="ml-3 text-sm font-semibold text-dm-text">
                        {t.title}
                      </span>
                      <span className="mt-2 block truncate text-[11px] text-dm-muted lg:mt-0 lg:ml-2 lg:inline lg:truncate">
                        ({t.householdName})
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/household/${t.householdId}?view=tasks`}
                      className="rounded-full bg-[var(--dm-accent)] px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dm-accent-ink)]"
                    >
                      Open
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section
            aria-labelledby="cash-strip"
            className="relative overflow-hidden rounded-3xl border border-[var(--dm-border-strong)] bg-gradient-to-b from-dm-surface to-dm-surface/45 p-6 shadow-xl shadow-black/[0.035] lg:flex lg:items-start lg:justify-between lg:gap-10 lg:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[var(--dm-electric-glow)] blur-3xl"
            />
            <div className="relative lg:max-w-xs">
              <p
                id="cash-strip"
                className="text-xs font-bold uppercase tracking-wider text-dm-muted"
              >
                Receipts lane
              </p>
              <p className="mt-4 text-[13px] leading-relaxed text-dm-muted">
                Money tools stay quieter here until attribution ships — slips still funnel into Feed & household tabs.
              </p>
              <p className="mt-6 font-mono text-4xl font-semibold tracking-tighter text-[var(--dm-accent)] tabular-nums">
                You are owed {owedPreview}
              </p>
            </div>
            <div className="relative mt-10 flex shrink-0 flex-col gap-4 lg:mt-0 lg:max-w-[15rem]">
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
                  className="inline-flex justify-center rounded-full bg-dm-electric px-8 py-3.5 text-center text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:brightness-105 active:scale-[0.99]"
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
