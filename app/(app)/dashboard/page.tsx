import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContextualActionChip } from "@/components/dashboard/contextual-action-chip";
import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { DormStatusRing } from "@/components/dashboard/dorm-status-ring";
import { HouseActivityFeed } from "@/components/dashboard/house-activity-feed";
import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
import { TodayStrip } from "@/components/dashboard/today-strip";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { loadReceiptFeedPreview } from "@/lib/receipts/feed-queries";
import { loadHouseActivityItems } from "@/lib/dashboard/house-activity";
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

  const { items: houseActivity } = await loadHouseActivityItems(
    households,
    receiptFeed,
    22,
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

  const hasHouseholds = households.length > 0;

  return (
    <div className="mx-auto w-full max-w-lg pb-24 lg:max-w-[72rem] lg:pb-9">
      <div className="flex flex-wrap items-start justify-between gap-4 lg:max-w-none">
        <div className="min-w-0 max-w-2xl">
          <p className="text-[11px] font-black uppercase tracking-[0.32em] text-dm-electric">
            Tonight&apos;s HQ
          </p>
          <h1 className="mt-1.5 text-[2.55rem] font-black leading-[1.05] tracking-tight text-dm-text sm:text-5xl lg:text-[3.1rem]">
            Homebase
          </h1>
          <p className="mt-2 max-w-lg text-[15px] leading-snug text-dm-muted sm:text-base">
            Chores earn little wins, receipts stay honest, vibes stay humane — minus
            the twenty-message receipt hunt.
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

      <div className="mt-7">
        <TodayStrip
          choresDue={openTasks.length}
          owedLabel={owedPreview}
          receiptsRecent={receiptsLast7d}
          flatmatesOthers={flatmatePeers}
          feedHighlightsCount={houseActivity.length}
          hasHouseholds={hasHouseholds}
        />
      </div>

      <div className="mt-4">
        <DashboardQuickActions
          scanHref={scanHref}
          hasHouseholds={hasHouseholds}
        />
      </div>

      <div className="mt-9 flex flex-col gap-9 xl:flex-row xl:gap-10">
        <div className="min-w-0 flex-1 space-y-8">
          <section
            aria-labelledby="open-chores"
            className="dm-card-surface dm-card-interactive relative overflow-hidden rounded-[1.35rem] p-5 lg:p-7"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 top-0 h-40 w-40 rounded-full bg-[var(--dm-electric-glow)] opacity-80 blur-3xl"
            />
            <div className="relative flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <p
                  id="open-chores"
                  className="text-[11px] font-black uppercase tracking-[0.2em] text-dm-electric"
                >
                  Tasks
                </p>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-dm-muted">
                  Shared wall of glory. Peek{" "}
                  <Link
                    href="/dashboard/tasks"
                    className="font-bold text-dm-electric underline decoration-dm-electric/45 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/50"
                  >
                    Tasks
                  </Link>{" "}
                  to drop chores or yoink points before someone else does.
                </p>
              </div>
              <Link
                href="/dashboard/tasks"
                className="dm-btn-secondary dm-hover-tap shrink-0 !px-5 !py-2.5 !text-[11px] !uppercase !tracking-wide"
              >
                All tasks
              </Link>
            </div>
            {tasksErr ? (
              <p className="relative mt-5 rounded-lg border border-amber-400/40 bg-[var(--dm-accent-warn-bg)] px-3 py-2 text-sm font-medium text-[var(--dm-accent-warn-text)]">
                Tasks are off until the database migration is applied.
              </p>
            ) : openTasks.length === 0 ? (
              <p className="relative mt-6 text-sm font-semibold leading-relaxed text-dm-text">
                Zilch in the chore queue · either spotless saints or procrastination aces
                🎓
              </p>
            ) : (
              <ul className="relative mt-5 space-y-2">
                {openTasks.slice(0, 4).map((t) => (
                  <li
                    key={t.id}
                    className="dm-card-interactive dm-fade-in-up flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[var(--dm-border-strong)] bg-[color-mix(in_srgb,var(--dm-surface-mid)_94%,transparent)] px-4 py-3"
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
                      className="dm-hover-tap rounded-lg border border-[color-mix(in_srgb,var(--dm-electric)_45%,transparent)] bg-[color-mix(in_srgb,var(--dm-electric)_8%,transparent)] px-3.5 py-1.5 text-[11px] font-black uppercase tracking-wide text-dm-electric transition-colors duration-200 hover:bg-[color-mix(in_srgb,var(--dm-electric)_16%,transparent)]"
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
            className="dm-card-surface dm-card-interactive relative overflow-hidden rounded-[1.35rem] p-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)] lg:items-start lg:gap-10 lg:p-7"
          >
            <div
              aria-hidden
              className="pointer-events-none absolute -right-24 -top-28 h-72 w-72 rounded-full bg-[var(--dm-electric-glow)] blur-3xl"
            />
            <div className="relative">
              <p
                id="cash-strip"
                className="text-[11px] font-black uppercase tracking-[0.2em] text-dm-electric"
              >
                Receipts · money vibes
              </p>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-dm-muted">
                Snap slips, AI does the sleepy math — no more blurry-thumb receipt
                retyping while half asleep.
              </p>
              <div className="mt-8 border-t border-[var(--dm-border)] pt-6 lg:mt-10">
                <p className="text-[11px] font-black uppercase tracking-[0.2em] text-dm-muted">
                  Balance preview (honest teaser)
                </p>
                <p className="mt-2 text-sm font-semibold text-dm-text">
                  You&apos;re theoretically owed{" "}
                  <span className="font-mono text-2xl font-black tabular-nums text-dm-accent lg:text-[1.95rem]">
                    {owedPreview}
                  </span>
                </p>
                <p className="mt-2 max-w-sm text-[13px] leading-relaxed text-dm-muted">
                  Real IOUs touchdown with splits. Meanwhile every scan beams into House
                  activity like a petty trophy case.
                </p>
              </div>
            </div>

            <div className="relative mt-8 flex flex-col gap-5 lg:mt-0">
              {scanHref ? (
                <Link
                  href={scanHref}
                  className="dm-scan-hero dm-hover-tap z-[1] inline-flex w-full items-center justify-center rounded-2xl px-7 py-[1.1rem] text-center text-base font-black tracking-tight text-[#071018] transition-[filter,transform] duration-200 hover:brightness-110 lg:text-[1.05rem]"
                >
                  Scan receipt · AI sparkle
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
                  className="dm-hover-tap dm-btn-secondary flex-1 basis-[min(100%,10rem)] !px-3 !py-2.5 !text-center md:flex-none md:basis-auto"
                >
                  Add expense
                </Link>
                <Link
                  href="/dashboard/finances"
                  title="Even splits launching soon"
                  className="dm-hover-tap dm-btn-secondary flex-1 basis-[min(100%,10rem)] !px-3 !py-2.5 !text-center md:flex-none md:basis-auto"
                >
                  Split bill
                </Link>
                <Link
                  href="/dashboard/finances"
                  title="Per-household balances next"
                  className="dm-hover-tap dm-btn-secondary flex-1 basis-[min(100%,10rem)] !px-3 !py-2.5 !text-center md:flex-none md:basis-auto"
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
            <div className="flex flex-wrap items-end justify-between gap-3 pb-4">
              <div>
                <h2
                  id="activity-feed"
                  className="text-xl font-black tracking-tight text-dm-text sm:text-[1.35rem]"
                >
                  House activity radar
                </h2>
                <p className="mt-1 max-w-xl text-[13px] leading-snug text-dm-muted">
                  Semi-live timeline: rogue receipts, completed chores, and soon the melodrama of who owes who.
                </p>
              </div>
              {feedErr ? (
                <span className="rounded-full bg-dm-danger/10 px-3 py-1 text-xs font-semibold text-dm-danger">
                  Receipts partial
                </span>
              ) : null}
            </div>
            <HouseActivityFeed
              items={houseActivity}
              showSamples={hasHouseholds}
            />
          </section>
        </div>

        <aside className="order-last flex w-full shrink-0 flex-col gap-5 xl:order-none xl:w-[min(100%,22rem)]">
          {hasHouseholds ? (
            <div className="dm-card-surface dm-card-interactive rounded-[1.25rem] p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
                Your spaces
              </p>
              <ul className="mt-4 space-y-2">
                {households.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/dashboard/household/${h.id}`}
                      className="dm-hover-tap flex items-center justify-between gap-4 rounded-xl border border-transparent px-3.5 py-2.5 transition-colors duration-200 hover:border-[var(--dm-border-strong)] hover:bg-[color-mix(in_srgb,var(--dm-surface-mid)_94%,transparent)]"
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
            className={`scroll-mt-28 dm-card-surface dm-card-interactive rounded-[1.25rem] p-5 lg:p-7 ${
              hasHouseholds
                ? "ring-1 ring-[color-mix(in_srgb,var(--dm-fun)_22%,transparent)]"
                : ""
            }`}
          >
            <h3 className="text-sm font-bold text-dm-text">
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
