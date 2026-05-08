import Link from "next/link";

import { MobileActionCardLink } from "@/components/mobile/mobile-action-card";
import { MobileListItem } from "@/components/mobile/mobile-list-item";
import { MobileSection } from "@/components/mobile/mobile-section";
import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import type { HouseActivityItem } from "@/lib/dashboard/house-activity";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import type { HouseholdTaskRow } from "@/lib/tasks/queries";
import { formatRelativeTime } from "@/lib/format-relative";

function greetingWord() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

function pickNextTask(tasks: HouseholdTaskRow[]) {
  const sorted = [...tasks].sort((a, b) => {
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
  primaryHouseholdId: string | null;
  hasHouseholds: boolean;
  choresDue: number;
  owedLabel: string;
  receiptsRecent: number;
  openTasks: HouseholdTaskRow[];
  activityPreview: HouseActivityItem[];
  activityError: boolean;
  householdsError: string | null;
};

function TaskGlyph() {
  return (
    <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M9 11l3 3 6-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect
        x="3"
        y="4"
        width="18"
        height="17"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
    </svg>
  );
}

function MoneyGlyph() {
  return (
    <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none">
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
    <svg aria-hidden className="h-6 w-6" viewBox="0 0 24 24" fill="none">
      <path
        d="M7 4h10v16l-2-1.5L12 20l-3 1.5L7 20V4z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path d="M9 8h6M9 11h6M9 14h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
      <circle cx="15" cy="7" r="2" fill="currentColor" opacity="0.35" />
    </svg>
  );
}

export function MobileDashboardHome({
  firstName,
  householdLine,
  primaryHouseholdId,
  hasHouseholds,
  choresDue,
  owedLabel,
  receiptsRecent,
  openTasks,
  activityPreview,
  activityError,
  householdsError,
}: MobileDashboardHomeProps) {
  const greet = greetingWord();
  const next = pickNextTask(openTasks);
  const expenseHref =
    primaryHouseholdId ?
      `/dashboard/household/${primaryHouseholdId}?view=expenses`
    : "/dashboard/finances";
  const receiptHref =
    primaryHouseholdId ?
      `/dashboard/household/${primaryHouseholdId}?view=receipts`
    : "/dashboard/more";

  return (
    <div className="mx-auto flex w-full max-w-lg flex-col gap-5 pb-2 lg:hidden">
      <div className="min-w-0 pt-1">
        <p className="break-words text-[1.7rem] font-semibold leading-[1.12] tracking-tight text-dm-text">
          {greet}
          {firstName ?
            <>
              ,{" "}
              <span className="text-[var(--dm-electric-deep)]">{firstName}</span>
            </>
          : null}
        </p>
        <p className="mt-2 text-[15px] leading-snug text-dm-muted">{householdLine}</p>
      </div>

      {householdsError ? (
        <div
          role="alert"
          className="rounded-xl border border-dm-danger/40 bg-dm-surface px-4 py-3.5 text-[14px] leading-relaxed text-dm-danger"
        >
          {shouldExposeSupabaseError() ? householdsError : PUBLIC_TRY_AGAIN}
        </div>
      ) : null}

      <MobileSection title="Today" hideDescriptionMobile>
        <ul className="flex flex-col gap-3">
          <li className="dm-card-surface flex min-h-[52px] items-center justify-between gap-4 px-4 py-3.5">
            <span className="text-[14px] font-semibold text-dm-muted">Chores</span>
            <span className="font-mono text-2xl font-bold tabular-nums text-dm-text">
              {hasHouseholds ? choresDue : "—"}
            </span>
          </li>
          <li className="dm-card-surface flex min-h-[52px] flex-row items-start justify-between gap-3 px-4 py-3.5">
            <span className="shrink-0 pt-0.5 text-[14px] font-semibold text-dm-muted">Balance</span>
            <span className="max-w-[65%] break-words text-right text-[15px] font-semibold leading-snug text-dm-text">
              {hasHouseholds ? owedLabel : "—"}
            </span>
          </li>
          <li className="dm-card-surface flex min-h-[52px] items-center justify-between gap-4 px-4 py-3.5">
            <span className="text-[14px] font-semibold text-dm-muted">Receipts · 7 days</span>
            <span className="font-mono text-2xl font-bold tabular-nums text-dm-text">
              {hasHouseholds ? receiptsRecent : "—"}
            </span>
          </li>
          <li className="dm-card-surface flex min-h-[52px] items-center justify-between gap-4 px-4 py-3.5">
            <span className="text-[14px] font-semibold text-dm-muted">Groceries</span>
            <span className="text-[16px] font-semibold text-dm-text">
              {hasHouseholds ? "Open" : "—"}
            </span>
          </li>
        </ul>
      </MobileSection>

      <MobileSection title="Quick actions" hideDescriptionMobile>
        <div className="flex flex-col gap-3">
          <MobileActionCardLink href="/dashboard/tasks" label="Add chore" icon={<TaskGlyph />} />
          <MobileActionCardLink href={expenseHref} label="Add expense" icon={<MoneyGlyph />} />
          <MobileActionCardLink href={receiptHref} label="Scan receipt" icon={<ReceiptGlyph />} />
        </div>
      </MobileSection>

      <MobileSection
        title="Up next"
        hideDescriptionMobile
      >
        {!hasHouseholds ?
          <p className="text-[15px] leading-relaxed text-dm-muted">
            Create a home — then chores show here.
          </p>
        : !next ?
          <p className="text-[15px] leading-relaxed text-dm-muted">You&apos;re caught up.</p>
        : (
          <MobileListItem
            title={next.title}
            subtitle={
              next.dueAt ?
                `Due ${new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(next.dueAt))}`
              : `Open · ${next.householdName}`}
            meta={`+${next.rewardPoints} pts`}
            href="/dashboard/tasks"
            trailing={
              <span className="inline-flex min-h-[40px] min-w-[4.5rem] items-center justify-center rounded-lg bg-[color-mix(in_srgb,var(--dm-accent-soft)_100%,transparent)] px-3 text-[13px] font-semibold text-[var(--dm-electric-deep)]">
                Open
              </span>
            }
          />
        )}
      </MobileSection>

      <MobileSection
        title="House activity"
        hideDescriptionMobile
        action={
          <Link
            href="/dashboard/more"
            className="touch-manipulation rounded-lg px-3 py-2 text-[14px] font-semibold text-dm-electric hover:bg-dm-elevated/80 hover:underline"
          >
            More
          </Link>
        }
      >
        {activityError ?
          <p className="text-[14px] text-dm-danger">Partial activity — refresh if needed.</p>
        : null}
        {activityPreview.length === 0 ?
          <p className="rounded-xl border border-dashed border-[var(--dm-border-strong)] px-4 py-8 text-center text-[15px] leading-relaxed text-dm-muted">
            Nothing new yet — check back after chores or receipts.
          </p>
        : (
          <ul className="flex flex-col gap-2">
            {activityPreview.slice(0, 4).map((item) => {
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
      </MobileSection>

      {!hasHouseholds ?
        <MobileSection title="Create home" hideDescriptionMobile>
          <CreateHouseholdForm className="space-y-5 max-lg:[&_input]:min-h-[48px] max-lg:[&_input]:text-[16px] max-lg:[&_button]:min-h-[52px]" />
        </MobileSection>
      : null}
    </div>
  );
}
