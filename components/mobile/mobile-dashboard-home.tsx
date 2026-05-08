import Link from "next/link";
import type { ReactNode } from "react";

import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import type { HouseActivityItem } from "@/lib/dashboard/house-activity";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import type { HouseholdMemberRow } from "@/lib/households/queries";
import type { HouseholdTaskRow } from "@/lib/tasks/queries";
import { formatRelativeTime } from "@/lib/format-relative";

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Morning";
  if (h < 18) return "Afternoon";
  return "Evening";
}

function summarizeActivity(item: HouseActivityItem): {
  title: string;
  subtitle: string;
  href?: string;
} {
  if (item.kind === "generic_note") {
    return {
      title: item.label,
      subtitle: item.body,
      href: item.href,
    };
  }
  if (item.kind === "receipt_saved") {
    return {
      title: item.merchant?.trim() || "Receipt",
      subtitle: `${item.savedByLabel}`,
      href: `/dashboard/household/${item.householdId}?view=receipts`,
    };
  }
  return {
    title: item.title,
    subtitle: `${item.completedByLabel} · +${item.points} pts`,
    href: `/dashboard/household/${item.householdId}?view=tasks`,
  };
}

export type MobileDashboardHomeProps = {
  firstName: string;
  householdLine: string;
  spotlightHomeName: string | null;
  spotlightHouseholdId: string | null;
  primaryHouseholdId: string | null;
  hasHouseholds: boolean;
  choresDue: number;
  choresOpenSpotlight: number;
  owedLabel: string;
  receiptsRecent: number;
  openGroceriesCount: number;
  openTasks: HouseholdTaskRow[];
  roommates: Pick<HouseholdMemberRow, "userId" | "displayName" | "avatarUrl" | "email" | "role">[];
  activityPreview: HouseActivityItem[];
  activityError: boolean;
  householdsError: string | null;
};

/** One-screen dashboard: no outer page scroll; fits ~640×390+ phones via compact density. */
export function MobileDashboardHome({
  firstName,
  householdLine,
  spotlightHomeName,
  spotlightHouseholdId,
  primaryHouseholdId,
  hasHouseholds,
  choresDue,
  choresOpenSpotlight,
  owedLabel,
  receiptsRecent,
  openGroceriesCount,
  openTasks: _openTasks,
  activityPreview,
  activityError,
  householdsError,
}: MobileDashboardHomeProps) {
  const greet = greetingWord();
  void _openTasks;

  const expenseHref =
    primaryHouseholdId ? `/dashboard/household/${primaryHouseholdId}?view=expenses` : "/dashboard/finances";
  const receiptHref =
    primaryHouseholdId ? `/dashboard/household/${primaryHouseholdId}?view=receipts` : "/dashboard/more";
  const groceryHref =
    primaryHouseholdId ?
      `/dashboard/inventory${spotlightHouseholdId ? `?household=${encodeURIComponent(spotlightHouseholdId)}` : ""}`
    : "/dashboard/inventory";

  const qa = (
    cls: string,
    href: string,
    glyph: ReactNode,
    label: string,
  ) => (
    <Link
      href={href}
      prefetch
      className={cls}
      aria-label={label}
    >
      <span className="text-[1.1rem] leading-none" aria-hidden>
        {glyph}
      </span>
      <span className="mt-0.5 max-w-full truncate text-[9px] font-bold uppercase tracking-wide text-dm-muted">
        {label}
      </span>
    </Link>
  );

  return (
    <div
      className={[
        "dm-mobile-home mx-auto flex w-full max-w-lg flex-col overflow-hidden px-2 lg:hidden",
        hasHouseholds ? "h-full min-h-0 gap-1.5 pt-0.5" : "min-h-0 flex-1 gap-2 py-1",
      ].join(" ")}
    >
      {!hasHouseholds ?
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch]">
          <p className="shrink-0 text-[clamp(12px,2.9vw,14px)] font-semibold text-dm-text">Let&apos;s set up Koti</p>
          <p className="mt-1 shrink-0 text-[11px] leading-snug text-dm-muted">{householdLine}</p>
          {householdsError ?
            <p className="mt-2 shrink-0 rounded-xl border border-dm-danger/35 px-3 py-2 text-[11px] text-dm-danger" role="alert">
              {shouldExposeSupabaseError() ? householdsError : PUBLIC_TRY_AGAIN}
            </p>
          : null}
          <section className="mt-3 shrink-0 rounded-2xl border border-dashed border-[var(--dm-border-strong)] bg-white/85 p-3">
            <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-dm-muted">Create home</p>
            <CreateHouseholdForm className="mt-2 space-y-3 [&_button]:min-h-[44px] [&_input]:min-h-[44px]" />
          </section>
        </div>
      : (
        <>
          <div className="flex shrink-0 items-start justify-between gap-2 pb-0.5 pt-1">
            <div className="min-w-0">
              <p className="text-[clamp(10px,2.8vw,12px)] font-bold uppercase tracking-[0.08em] text-dm-muted">
                {greet}
                {firstName ?
                  <>
                    {" "}
                    <span className="text-[var(--dm-electric-deep)]">{firstName}</span>
                  </>
                : null}
              </p>
              <p className="mt-0.5 line-clamp-1 text-[clamp(11px,3vw,13px)] font-semibold leading-tight text-dm-text">
                {spotlightHomeName ?? householdLine}
              </p>
            </div>
            {spotlightHouseholdId ?
              <Link
                href={`/dashboard/household/${spotlightHouseholdId}`}
                prefetch
                className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--dm-social)_28%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-social)_10%,white)] px-2.5 py-1 text-[10px] font-bold text-dm-text active:scale-[0.98] motion-reduce:transition-none"
              >
                Open
              </Link>
            : null}
          </div>

          {householdsError ?
            <p className="shrink-0 rounded-lg border border-dm-danger/35 px-2 py-1.5 text-[11px] text-dm-danger" role="alert">
              {shouldExposeSupabaseError() ? householdsError : PUBLIC_TRY_AGAIN}
            </p>
          : null}

          <section className="shrink-0 overflow-hidden rounded-[14px] border border-[color-mix(in_srgb,var(--dm-electric)_26%,var(--dm-border-strong))] bg-[linear-gradient(152deg,color-mix(in_srgb,var(--dm-electric)_11%,#fff)_0%,#f6f6fb_55%,#ecf2ef_100%)] px-3 py-2 shadow-[0_10px_22px_rgba(28,39,56,0.08)]">
            <div className="flex items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-[color-mix(in_srgb,var(--dm-electric-deep)_65%,var(--dm-muted)_35%)]">
                Today
              </p>
              {receiptsRecent > 0 ?
                <span className="rounded-full border border-[var(--dm-border-strong)] bg-white/75 px-2 py-0.5 text-[9px] font-bold tabular-nums text-dm-muted">
                  {receiptsRecent} receipts · 7d
                </span>
              : null}
            </div>
            <div className="mt-2 grid grid-cols-3 gap-x-2 gap-y-2">
              <div className="min-w-0 text-center">
                <p className="text-[8px] font-bold uppercase tracking-wide text-dm-muted">Groceries</p>
                <p className="text-[clamp(1.05rem,4vw,1.25rem)] font-bold tabular-nums leading-none text-dm-text">
                  {openGroceriesCount}
                </p>
                <p className="truncate text-[9px] text-dm-muted">to buy</p>
              </div>
              <div className="min-w-0 text-center border-x border-[color-mix(in_srgb,var(--dm-border)_70%,transparent)] px-1">
                <p className="text-[8px] font-bold uppercase tracking-wide text-dm-muted">Chores</p>
                <p className="text-[clamp(1.05rem,4vw,1.25rem)] font-bold tabular-nums leading-none text-dm-text">
                  {choresOpenSpotlight}
                </p>
                <p className="truncate text-[9px] text-dm-muted">
                  open
                  {choresDue !== choresOpenSpotlight ?
                    <>
                      {" "}
                      ({choresDue} total)
                    </>
                  : null}
                </p>
              </div>
              <div className="min-w-0 text-center">
                <p className="text-[8px] font-bold uppercase tracking-wide text-dm-muted">Money</p>
                <p className="line-clamp-2 max-h-[2.35rem] break-words text-[clamp(11px,2.85vw,12px)] font-bold leading-snug text-dm-text">
                  {owedLabel}
                </p>
              </div>
            </div>
          </section>

          <div className="grid shrink-0 grid-cols-4 gap-1.5 px-px">
            {qa(
              "dm-focus-ring flex min-h-[44px] touch-manipulation flex-col items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--dm-accent)_32%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-accent)_10%,white)] py-2 text-dm-text shadow-sm active:scale-[0.98] motion-reduce:transition-none",
              groceryHref,
              "◧",
              "Grocery",
            )}
            {qa(
              "dm-focus-ring flex min-h-[44px] touch-manipulation flex-col items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--dm-highlight)_40%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-highlight)_8%,white)] py-2 text-dm-text shadow-sm active:scale-[0.98] motion-reduce:transition-none",
              "/dashboard/tasks",
              "✓",
              "Chore",
            )}
            {qa(
              "dm-focus-ring flex min-h-[44px] touch-manipulation flex-col items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--dm-info)_30%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-info)_8%,white)] py-2 text-dm-text shadow-sm active:scale-[0.98] motion-reduce:transition-none",
              expenseHref,
              "$",
              "Expense",
            )}
            {qa(
              "dm-focus-ring flex min-h-[44px] touch-manipulation flex-col items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--dm-success)_38%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-success)_7%,white)] py-2 text-dm-text shadow-sm active:scale-[0.98] motion-reduce:transition-none",
              receiptHref,
              "📷",
              "Scan",
            )}
          </div>

          <section className="grid shrink-0 grid-cols-3 gap-1.5 px-px">
            <Link
              href={groceryHref}
              prefetch
              className="dm-focus-ring flex min-h-[48px] flex-col justify-center rounded-xl border border-[var(--dm-border-strong)] bg-white/92 px-2 py-1.5 text-center shadow-[0_8px_16px_rgba(28,39,56,0.06)] active:scale-[0.98] motion-reduce:transition-none"
            >
              <span className="text-[8px] font-bold uppercase tracking-wide text-dm-muted">Groceries</span>
              <span className="text-[clamp(1rem,4vw,1.2rem)] font-bold tabular-nums">{openGroceriesCount}</span>
            </Link>
            <Link
              href="/dashboard/tasks"
              prefetch
              className="dm-focus-ring flex min-h-[48px] flex-col justify-center rounded-xl border border-[var(--dm-border-strong)] bg-white/92 px-2 py-1.5 text-center shadow-[0_8px_16px_rgba(28,39,56,0.06)] active:scale-[0.98] motion-reduce:transition-none"
            >
              <span className="text-[8px] font-bold uppercase tracking-wide text-dm-muted">Chores</span>
              <span className="text-[clamp(1rem,4vw,1.2rem)] font-bold tabular-nums">{choresOpenSpotlight}</span>
            </Link>
            <Link
              href="/dashboard/finances"
              prefetch
              className="dm-focus-ring flex min-h-[48px] flex-col justify-center rounded-xl border border-[var(--dm-border-strong)] bg-white/92 px-2 py-1.5 text-center shadow-[0_8px_16px_rgba(28,39,56,0.06)] active:scale-[0.98] motion-reduce:transition-none"
            >
              <span className="text-[8px] font-bold uppercase tracking-wide text-dm-muted">Money</span>
              <span className="line-clamp-2 min-h-[1.9rem] break-words text-[10px] font-bold leading-tight text-dm-text">
                {owedLabel}
              </span>
            </Link>
          </section>

          <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[14px] border border-[var(--dm-border-strong)] bg-[linear-gradient(180deg,#fffefb_0%,#f3f5f8_100%)] px-2.5 py-2 shadow-inner">
            <div className="flex shrink-0 items-center justify-between gap-2">
              <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-dm-muted">Recent</p>
              <Link
                href="/dashboard/activity"
                prefetch
                className="min-h-[36px] shrink-0 px-1 text-[11px] font-bold text-dm-electric"
              >
                View all
              </Link>
            </div>
            {activityError ?
              <p className="shrink-0 text-[10px] text-dm-danger">Partial feed.</p>
            : activityPreview.length === 0 ?
              <p className="line-clamp-2 text-[10px] leading-snug text-dm-muted">Quiet — finish a chore or log a receipt.</p>
            : (
              <ul className="mt-1 min-h-0 flex-1 space-y-1 overflow-hidden">
                {activityPreview.slice(0, 2).map((item) => {
                  const s = summarizeActivity(item);
                  const inner = (
                    <>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-[11px] font-semibold leading-tight text-dm-text">{s.title}</p>
                        <p className="line-clamp-1 text-[10px] text-dm-muted">{s.subtitle}</p>
                      </div>
                      <span className="ml-2 shrink-0 whitespace-nowrap text-[9px] font-semibold text-dm-muted">
                        {formatRelativeTime(item.at)}
                      </span>
                    </>
                  );
                  return (
                    <li key={`${item.kind}-${item.id}`}>
                      {s.href ?
                        <Link
                          href={s.href}
                          prefetch
                          className="flex min-h-[40px] items-center rounded-lg border border-transparent px-2 py-1 hover:border-[var(--dm-border-strong)] hover:bg-white/70 active:scale-[0.99] motion-reduce:transition-none"
                        >
                          {inner}
                        </Link>
                      : (
                        <div className="flex min-h-[40px] items-center px-2 py-1">{inner}</div>
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
  );
}
