import Link from "next/link";

import { MobileActionCardLink } from "@/components/mobile/mobile-action-card";
import { MobileListItem } from "@/components/mobile/mobile-list-item";
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

function pickNextTaskForHome(tasks: HouseholdTaskRow[], homeId: string | null) {
  const scoped = homeId ? tasks.filter((t) => t.householdId === homeId) : tasks;
  const sorted = [...scoped].sort((a, b) => {
    if (!a.dueAt && !b.dueAt) return 0;
    if (!a.dueAt) return 1;
    if (!b.dueAt) return -1;
    return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
  });
  return sorted[0];
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
      title: `Receipt · ${item.merchant?.trim() || "Shop"}`,
      subtitle: `${item.savedByLabel} · ${item.amountLabel}`,
      href: `/dashboard/household/${item.householdId}?view=receipts`,
    };
  }
  return {
    title: item.title,
    subtitle: `${item.completedByLabel} · +${item.points} pts · ${item.householdName}`,
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

function TaskGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path d="M9 11l3 3 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="4" width="18" height="17" rx="2" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  );
}

function MoneyGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="8" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8v8M9.5 10h4a1.5 1.5 0 010 3h-3a1.5 1.5 0 000 3h4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ReceiptGlyph() {
  return (
    <svg aria-hidden className="h-5 w-5" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4h10v16l-2-1.5L12 20l-3 1.5L7 20V4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}

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
  openTasks,
  roommates,
  activityPreview,
  activityError,
  householdsError,
}: MobileDashboardHomeProps) {
  const greet = greetingWord();
  const next = pickNextTaskForHome(openTasks, spotlightHouseholdId);
  const expenseHref =
    primaryHouseholdId ? `/dashboard/household/${primaryHouseholdId}?view=expenses` : "/dashboard/finances";
  const receiptHref =
    primaryHouseholdId ? `/dashboard/household/${primaryHouseholdId}?view=receipts` : "/dashboard/more";
  const groceryHref =
    primaryHouseholdId ?
      `/dashboard/inventory${spotlightHouseholdId ? `?household=${encodeURIComponent(spotlightHouseholdId)}` : ""}`
    : "/dashboard/inventory";

  return (
    <div className="dm-mobile-home mx-auto flex w-full max-w-lg flex-col gap-5 pb-3 lg:hidden">
      {/* 1 · Greeting + status */}
      <div className="px-0.5 pt-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-[13px] font-semibold uppercase tracking-[0.12em] text-dm-muted">
            {greet}
            {firstName ? (
              <>
                , <span className="text-[var(--dm-electric-deep)]">{firstName}</span>
              </>
            ) : null}
          </p>
          {spotlightHomeName ?
            <span className="rounded-full border border-[color-mix(in_srgb,var(--dm-social)_35%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-social)_12%,white)] px-2.5 py-0.5 text-[11px] font-bold text-dm-text">
              {spotlightHomeName}
            </span>
          : null}
        </div>
        <p className="mt-1.5 text-[14px] leading-snug text-dm-muted">{householdLine}</p>
      </div>

      {householdsError ? (
        <div
          role="alert"
          className="rounded-2xl border border-dm-danger/40 bg-dm-surface px-4 py-3.5 text-[14px] leading-relaxed text-dm-danger"
        >
          {shouldExposeSupabaseError() ? householdsError : PUBLIC_TRY_AGAIN}
        </div>
      ) : null}

      {/* 2 · Today card */}
      <section className="overflow-hidden rounded-[20px] border border-[color-mix(in_srgb,var(--dm-electric)_28%,var(--dm-border-strong))] bg-[linear-gradient(148deg,color-mix(in_srgb,var(--dm-electric)_12%,#fff)_0%,#f7f5fb_48%,#eef5f2_100%)] p-[1rem] shadow-[0_14px_36px_rgba(28,39,56,0.11)]">
        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[color-mix(in_srgb,var(--dm-electric-deep)_70%,var(--dm-muted)_30%)]">
          Today
        </p>
        {!hasHouseholds ?
          <p className="mt-2 text-[15px] leading-relaxed text-dm-muted">
            Create your first shared home below—then today&apos;s pulse fills in automatically.
          </p>
        : !next ?
          <p className="mt-2 text-[17px] font-semibold leading-snug text-dm-text">You&apos;re caught up for now.</p>
        : (
          <>
            <p className="mt-2 line-clamp-2 text-[17px] font-semibold leading-snug text-dm-text">{next.title}</p>
            <p className="mt-1.5 text-[13px] text-dm-muted">
              {next.dueAt ?
                `Due ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(next.dueAt))}`
              : `${next.householdName}`}
              {" · "}
              <span className="font-semibold text-dm-text">+{next.rewardPoints} pts</span>
            </p>
            <Link
              href="/dashboard/tasks"
              className="dm-focus-ring mt-4 flex min-h-[48px] items-center justify-center rounded-2xl bg-dm-electric text-[15px] font-bold text-white shadow-[0_10px_26px_rgba(200,104,69,0.28)] active:brightness-95"
            >
              Open chores
            </Link>
          </>
        )}
        {hasHouseholds ?
          <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[color-mix(in_srgb,var(--dm-border)_80%,transparent)] pt-4">
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-dm-muted">Chores</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-dm-text">{choresDue}</p>
            </div>
            <div className="text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-dm-muted">List</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-dm-text">{openGroceriesCount}</p>
            </div>
            <div className="min-w-0 text-center">
              <p className="text-[10px] font-bold uppercase tracking-wide text-dm-muted">7d rcpt</p>
              <p className="mt-0.5 text-xl font-bold tabular-nums text-dm-text">{receiptsRecent}</p>
            </div>
          </div>
        : null}
        {hasHouseholds ?
          <p className="mt-3 min-w-0 break-words text-center text-[13px] font-semibold leading-snug text-dm-text">
            <span className="text-dm-muted">Balance · </span>
            {owedLabel}
          </p>
        : null}
      </section>

      {/* 3 · Quick actions — horizontal */}
      <section>
        <p className="mb-2 px-0.5 text-[12px] font-bold uppercase tracking-[0.1em] text-dm-muted">Quick</p>
        <ul className="flex snap-x snap-mandatory gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li className="min-w-[88%] shrink-0 snap-center sm:min-w-[200px]">
            <MobileActionCardLink href="/dashboard/tasks" label="Chore" icon={<TaskGlyph />} />
          </li>
          <li className="min-w-[88%] shrink-0 snap-center sm:min-w-[200px]">
            <MobileActionCardLink href={expenseHref} label="Expense" icon={<MoneyGlyph />} />
          </li>
          <li className="min-w-[88%] shrink-0 snap-center sm:min-w-[200px]">
            <MobileActionCardLink href={receiptHref} label="Receipt" icon={<ReceiptGlyph />} />
          </li>
          <li className="min-w-[88%] shrink-0 snap-center sm:min-w-[200px]">
            <MobileActionCardLink href={groceryHref} label="Grocery" icon={<span className="text-lg" aria-hidden>◧</span>} />
          </li>
        </ul>
      </section>

      {/* 4 · Horizontal previews */}
      <section>
        <p className="mb-2 px-0.5 text-[12px] font-bold uppercase tracking-[0.1em] text-dm-muted">Jump in</p>
        <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <li className="w-[min(78vw,17.5rem)] shrink-0 snap-start">
            <Link
              href={groceryHref}
              className="dm-focus-ring flex h-full min-h-[132px] flex-col justify-between rounded-[18px] border border-[color-mix(in_srgb,var(--dm-accent)_32%,var(--dm-border-strong))] bg-[linear-gradient(165deg,#fff_0%,#ecf5ef_100%)] p-4 shadow-[0_12px_28px_rgba(28,39,56,0.07)] active:scale-[0.99]"
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-[color-mix(in_srgb,var(--dm-accent)_75%,var(--dm-muted)_25%)]">
                Groceries
              </span>
              <span className="text-3xl font-bold tabular-nums text-dm-text">{openGroceriesCount}</span>
              <span className="text-[13px] font-semibold text-dm-muted">items to grab</span>
            </Link>
          </li>
          <li className="w-[min(78vw,17.5rem)] shrink-0 snap-start">
            <Link
              href="/dashboard/tasks"
              className="dm-focus-ring flex h-full min-h-[132px] flex-col justify-between rounded-[18px] border border-[color-mix(in_srgb,var(--dm-highlight)_40%,var(--dm-border-strong))] bg-[linear-gradient(165deg,#fffdf9_0%,#faf4e6_100%)] p-4 shadow-[0_12px_28px_rgba(28,39,56,0.07)] active:scale-[0.99]"
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-dm-muted">Chores</span>
              <span className="text-3xl font-bold tabular-nums text-dm-text">{choresOpenSpotlight}</span>
              <span className="text-[13px] font-semibold text-dm-muted">open here</span>
            </Link>
          </li>
          <li className="w-[min(78vw,17.5rem)] shrink-0 snap-start">
            <Link
              href="/dashboard/finances"
              className="dm-focus-ring flex h-full min-h-[132px] flex-col justify-between rounded-[18px] border border-[color-mix(in_srgb,var(--dm-info)_30%,var(--dm-border-strong))] bg-[linear-gradient(165deg,#fbfcfe_0%,#eaf0f9_100%)] p-4 shadow-[0_12px_28px_rgba(28,39,56,0.07)] active:scale-[0.99]"
            >
              <span className="text-[11px] font-bold uppercase tracking-wide text-dm-muted">Money</span>
              <span className="mt-1 line-clamp-3 min-h-[2.85rem] break-words text-[15px] font-semibold leading-snug text-dm-text">
                {owedLabel}
              </span>
              <span className="text-[13px] font-semibold text-[var(--dm-electric-deep)]">Balances →</span>
            </Link>
          </li>
        </ul>
      </section>

      {/* 5 · Roommates */}
      {hasHouseholds ?
        <section className="rounded-[18px] border border-[var(--dm-border-strong)] bg-dm-surface/95 p-4 shadow-[0_10px_24px_rgba(28,39,56,0.06)]">
          <div className="mb-3 flex items-center justify-between gap-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-dm-muted">Roommates</p>
            {spotlightHouseholdId ?
              <Link
                href={`/dashboard/household/${spotlightHouseholdId}?view=members`}
                className="text-[13px] font-bold text-dm-electric"
              >
                All
              </Link>
            : null}
          </div>
          {roommates.length === 0 ?
            <p className="text-[14px] text-dm-muted">No one listed yet.</p>
          : (
            <ul className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {roommates.slice(0, 8).map((m) => {
                const label = m.displayName?.trim() || m.email?.trim() || "Roommate";
                const initial = label.slice(0, 1).toUpperCase();
                return (
                  <li key={m.userId} className="w-[4.5rem] shrink-0 text-center">
                    {m.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.avatarUrl}
                        alt=""
                        className="mx-auto h-14 w-14 rounded-2xl border border-[var(--dm-border-strong)] object-cover shadow-sm"
                      />
                    ) : (
                      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface-mid text-[15px] font-bold text-dm-text">
                        {initial}
                      </span>
                    )}
                    <p className="mt-1.5 truncate text-[12px] font-semibold text-dm-text">{label}</p>
                    <p className="truncate text-[10px] capitalize text-dm-muted">{m.role}</p>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      : null}

      {/* 6–7 · Activity */}
      <section className="rounded-[18px] border border-[var(--dm-border-strong)] bg-[linear-gradient(180deg,#fffefb_0%,#f5f6fa_100%)] p-4 shadow-[0_10px_24px_rgba(28,39,56,0.06)]">
        <div className="mb-3 flex items-center justify-between gap-2">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-dm-muted">Latest</p>
          <Link
            href="/dashboard/activity"
            className="min-h-[44px] px-2 text-[13px] font-bold text-dm-electric"
          >
            View all activity
          </Link>
        </div>
        {activityError ?
          <p className="text-[13px] text-dm-danger">Partial feed—pull to refresh the app.</p>
        : activityPreview.length === 0 ?
          <p className="rounded-xl border border-dashed border-[var(--dm-border-strong)] px-3 py-6 text-center text-[14px] text-dm-muted">
            Quiet for now. Finish a chore or save a receipt and it&apos;ll show up here.
          </p>
        : (
          <ul className="flex flex-col gap-2">
            {activityPreview.slice(0, 3).map((item) => {
              const s = summarizeActivity(item);
              return (
                <li key={`${item.kind}-${item.id}`}>
                  <MobileListItem
                    title={s.title}
                    subtitle={s.subtitle}
                    meta={formatRelativeTime(item.at)}
                    href={s.href}
                  />
                </li>
              );
            })}
          </ul>
        )}
      </section>

      {!hasHouseholds ?
        <section className="rounded-[18px] border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/90 p-4">
          <p className="text-[12px] font-bold uppercase tracking-[0.1em] text-dm-muted">Create home</p>
          <CreateHouseholdForm className="mt-3 space-y-4 max-lg:[&_input]:min-h-[48px] max-lg:[&_input]:text-[16px] max-lg:[&_button]:min-h-[52px]" />
        </section>
      : null}
    </div>
  );
}
