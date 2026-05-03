import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContextualActionChip } from "@/components/dashboard/contextual-action-chip";
import { DashboardFeed } from "@/components/dashboard/dashboard-feed";
import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { DormStatusRing } from "@/components/dashboard/dorm-status-ring";
import { TodayStrip } from "@/components/dashboard/today-strip";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { loadReceiptFeedPreview } from "@/lib/receipts/feed-queries";
import {
  countReceiptsSince,
  loadDistinctHousemateCount,
} from "@/lib/dashboard/home-metrics";
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

  const householdIds = households.map((h) => h.id);
  const flatmatePeers = await loadDistinctHousemateCount(
    householdIds,
    user.id,
  );
  const receiptsLast7d = countReceiptsSince(receiptFeed, 7);

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

  const hasHouseholds = households.length > 0;

  return (
    <div className="mx-auto w-full max-w-lg pb-[7.5rem] lg:max-w-6xl lg:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 lg:max-w-none">
        <div className="min-w-0 max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-dm-electric">
            Today
          </p>
          <h1 className="mt-2 text-4xl font-black tracking-tight text-dm-text sm:text-5xl lg:text-[3.25rem] lg:leading-[1.08]">
            Home
          </h1>
          <p className="mt-2 text-base leading-snug text-dm-text/90 sm:text-lg sm:leading-normal">
            Keep chores, receipts, and roommate money under control — without the
            spreadsheet energy.
          </p>
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

      <div className="mt-9">
        <TodayStrip
          choresDue={openTasks.length}
          owedLabel={owedPreview}
          receiptsRecent={receiptsLast7d}
          flatmatesOthers={flatmatePeers}
          hasHouseholds={hasHouseholds}
        />
      </div>

      <div className="mt-12 flex flex-col gap-12 xl:flex-row xl:gap-14">
        <div className="min-w-0 flex-1 space-y-10">
          <section
            aria-labelledby="open-chores"
            className="relative overflow-hidden rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/78 p-6 shadow-lg shadow-black/[0.04] backdrop-blur-md lg:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-[var(--dm-electric-glow)] opacity-80 blur-3xl"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p
                  id="open-chores"
                  className="text-xs font-bold uppercase tracking-wider text-dm-electric"
                >
                  Tasks
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-dm-text">
                  One list for the flat. Open{" "}
                  <Link
                    href="/dashboard/tasks"
                    className="font-semibold text-dm-electric underline decoration-dm-electric/40 underline-offset-2 hover:decoration-dm-electric"
                  >
                    Tasks
                  </Link>{" "}
                  to add chores or claim points.
                </p>
              </div>
              <Link
                href="/dashboard/tasks"
                className="inline-flex shrink-0 items-center justify-center rounded-full border border-dm-electric bg-[color-mix(in_srgb,var(--dm-electric)_10%,transparent)] px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-dm-electric transition hover:bg-[color-mix(in_srgb,var(--dm-electric)_16%,transparent)]"
              >
                All tasks
              </Link>
            </div>
            {tasksErr ? (
              <p className="relative mt-5 rounded-lg border border-amber-400/40 bg-[var(--dm-accent-warn-bg)] px-3 py-2 text-sm font-medium text-[var(--dm-accent-warn-text)]">
                Tasks are off until the database migration is applied.
              </p>
            ) : openTasks.length === 0 ? (
              <p className="relative mt-6 text-sm font-medium text-dm-text">
                All clear — nothing open on the board.
              </p>
            ) : (
              <ul className="relative mt-6 space-y-2.5">
                {openTasks.slice(0, 4).map((t) => (
                  <li
                    key={t.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--dm-border-strong)] bg-dm-bg/55 px-4 py-3.5"
                  >
                    <div className="min-w-0">
                      <span className="inline-flex rounded-md bg-[color-mix(in_srgb,var(--dm-electric)_14%,transparent)] px-2 py-0.5 font-mono text-[11px] font-bold tabular-nums text-dm-electric">
                        +{t.rewardPoints}
                      </span>
                      <span className="ml-2.5 text-sm font-semibold text-dm-text">
                        {t.title}
                      </span>
                      <span className="mt-1.5 block truncate text-xs text-dm-muted sm:mt-0 sm:ml-2 sm:inline">
                        {t.householdName}
                      </span>
                    </div>
                    <Link
                      href={`/dashboard/household/${t.householdId}?view=tasks`}
                      className="rounded-full border border-dm-electric px-4 py-1.5 text-[11px] font-bold uppercase tracking-wide text-dm-electric transition hover:bg-[color-mix(in_srgb,var(--dm-electric)_10%,transparent)]"
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
            className="relative overflow-hidden rounded-3xl border border-[var(--dm-border-strong)] bg-gradient-to-b from-dm-surface via-dm-surface to-dm-surface/82 p-6 shadow-xl shadow-black/[0.04] lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-12 lg:p-8"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--dm-electric-glow)] blur-3xl"
            />
            <div className="relative">
              <p
                id="cash-strip"
                className="text-xs font-bold uppercase tracking-wider text-dm-electric"
              >
                Receipts
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-dm-text">
                Photo-first. Totals extracted so receipts don&apos;t live in dusty
                group chats forever.
              </p>
              <div className="mt-10 border-t border-[var(--dm-border)] pt-6 lg:mt-14">
                <p className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
                  Balance preview
                </p>
                <p className="mt-2 text-sm font-medium text-dm-text">
                  You are owed{" "}
                  <span className="font-mono text-2xl font-bold tabular-nums text-dm-accent lg:text-[1.85rem]">
                    {owedPreview}
                  </span>
                </p>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-dm-muted">
                  Full IOUs arrive with split math — everything you scan still shows up
                  in House activity underneath.
                </p>
              </div>
            </div>

            <div className="relative mt-8 flex flex-col gap-5 lg:mt-0">
              {scanHref ? (
                <Link
                  href={scanHref}
                  className="dm-scan-hero z-[1] inline-flex w-full items-center justify-center rounded-2xl bg-dm-electric px-7 py-[1.15rem] text-center text-base font-bold tracking-tight text-white transition hover:brightness-110 active:scale-[0.99] lg:text-[1.065rem]"
                >
                  Scan receipt · AI
                </Link>
              ) : (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-2xl border border-[var(--dm-border-strong)] bg-dm-bg/50 px-8 py-4 text-center text-sm font-medium text-dm-muted"
                >
                  Create a household — then scans unlock here.
                </button>
              )}

              <div className="flex flex-wrap gap-2">
                <Link
                  href="/dashboard/finances"
                  title="Detailed ledger tooling is on the way"
                  className="flex-1 basis-[min(100%,10rem)] rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/60 px-3 py-2.5 text-center text-xs font-semibold text-dm-text transition hover:border-dm-electric/40 hover:text-dm-electric md:flex-none md:basis-auto"
                >
                  Add expense
                </Link>
                <Link
                  href="/dashboard/finances"
                  title="Even splits launching soon"
                  className="flex-1 basis-[min(100%,10rem)] rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/60 px-3 py-2.5 text-center text-xs font-semibold text-dm-text transition hover:border-dm-electric/40 hover:text-dm-electric md:flex-none md:basis-auto"
                >
                  Split bill
                </Link>
                <Link
                  href="/dashboard/finances"
                  title="Per-household balances next"
                  className="flex-1 basis-[min(100%,10rem)] rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/60 px-3 py-2.5 text-center text-xs font-semibold text-dm-text transition hover:border-dm-electric/40 hover:text-dm-electric md:flex-none md:basis-auto"
                >
                  Balances
                </Link>
              </div>

              <ContextualActionChip
                householdsCount={households.length}
                receiptsCountAllTime={realReceiptCount}
                primaryHouseholdHasReceipts={firstHhReceipts > 0}
                scanReceiptHref={scanHref}
                createHouseholdHint={households.length === 0}
              />
            </div>
          </section>

          <section aria-labelledby="activity-feed">
            <div className="flex flex-wrap items-end justify-between gap-3 pb-5">
              <div>
                <h2
                  id="activity-feed"
                  className="text-lg font-semibold tracking-tight text-dm-text"
                >
                  House activity
                </h2>
                <p className="mt-1 text-sm text-dm-muted">
                  Who logged what lately — mixes receipts with coming-soon roommate
                  pings.
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

        <aside className="order-last flex w-full shrink-0 flex-col gap-6 xl:order-none xl:w-[min(100%,21rem)]">
          {hasHouseholds ? (
            <div className="rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/72 p-6 shadow-lg shadow-black/[0.04] backdrop-blur-md">
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
                      <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--dm-electric)_12%,transparent)] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-dm-electric">
                        {h.role}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div
            id="create-household"
            className={`scroll-mt-28 rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/72 p-6 shadow-lg shadow-black/[0.04] backdrop-blur-md lg:p-8 ${
              hasHouseholds ? "ring-1 ring-[var(--dm-border)]" : ""
            }`}
          >
            <h3 className="text-sm font-semibold text-dm-text">
              {hasHouseholds ? "Add another household" : "Create a household"}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-dm-muted">
              {hasHouseholds
                ? "Optional — for a second dorm or sublet group."
                : "Name your flat or dorm so tasks and receipts have a home."}
            </p>
            <CreateHouseholdForm className="mt-5 space-y-5" />
          </div>
        </aside>
      </div>
    </div>
  );
}
