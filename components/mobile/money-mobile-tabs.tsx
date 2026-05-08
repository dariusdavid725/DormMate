"use client";

import Link from "next/link";
import { useState } from "react";

import { formatMoneySafe } from "@/lib/currency/format-money";

export type MoneyMobileHouseRow = {
  id: string;
  name: string;
  role: string;
  balanceLabel: string;
  balanceError: boolean;
  pendingCount: number;
  settledCount: number;
  whoOwes: string;
};

export type MoneyMobileReceipt = {
  id: string;
  householdId: string;
  merchant: string | null;
  householdName: string;
  savedByLabel: string;
  totalAmount: number | null;
  currency: string;
};

type FocusPulse = {
  householdId: string;
  pendingCount: number;
  settledCount: number;
  whoOwes: string;
} | null;

const TABS = [
  { id: "overview" as const, label: "Overview" },
  { id: "expenses" as const, label: "Expenses" },
  { id: "receipts" as const, label: "Receipts" },
  { id: "settle" as const, label: "Settle" },
];

export function MoneyMobileTabs({
  houses,
  receipts,
  focusPulse,
  dominantCurrency,
  globalPending,
  globalSettled,
  globalMonthSpend,
  balanceOverview,
  hasHouseholds,
}: {
  houses: MoneyMobileHouseRow[];
  receipts: MoneyMobileReceipt[];
  focusPulse: FocusPulse;
  dominantCurrency: string;
  globalPending: number;
  globalSettled: number;
  globalMonthSpend: number;
  balanceOverview: string;
  hasHouseholds: boolean;
}) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("overview");

  return (
    <div className="space-y-4 pb-2 lg:hidden">
      <div
        className="flex gap-1 rounded-[14px] border border-[var(--dm-border-strong)] bg-[color-mix(in_srgb,var(--dm-surface-mid)_85%,white)] p-1 shadow-inner"
        role="tablist"
        aria-label="Money sections"
      >
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={[
              "touch-manipulation min-h-[44px] flex-1 rounded-[11px] px-2 text-[12px] font-bold motion-reduce:transition-none transition-[background-color,box-shadow,color,transform] duration-200 motion-reduce:active:scale-100 active:scale-[0.98]",
              tab === t.id ?
                "bg-white text-[var(--dm-electric-deep)] shadow-[0_6px_14px_rgba(28,39,56,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]"
              : "text-dm-muted",
            ].join(" ")}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" ?
        <section className="overflow-hidden rounded-[18px] border border-[color-mix(in_srgb,var(--dm-info)_22%,var(--dm-border-strong))] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--dm-info)_8%,#fff)_0%,#fffefb_55%)] p-4 shadow-[0_14px_32px_rgba(28,39,56,0.08)]">
          {!hasHouseholds ?
            <p className="text-[15px] leading-relaxed text-dm-muted">
              Create a home from{" "}
              <Link href="/dashboard" className="font-semibold text-dm-electric underline-offset-2 hover:underline">
                Home
              </Link>{" "}
              to track splits.
            </p>
          : (
            <>
              <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-dm-muted">Your position</p>
              <p className="mt-2 min-w-0 break-words text-xl font-semibold leading-snug text-dm-text">{balanceOverview}</p>
              <div className="mt-4 grid grid-cols-3 gap-2">
                <div className="rounded-xl border border-[var(--dm-border)] bg-white/80 px-2 py-2.5 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-dm-muted">Pending</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-dm-text">{globalPending}</p>
                </div>
                <div className="rounded-xl border border-[var(--dm-border)] bg-white/80 px-2 py-2.5 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-dm-muted">Settled</p>
                  <p className="mt-1 text-lg font-bold tabular-nums text-dm-text">{globalSettled}</p>
                </div>
                <div className="rounded-xl border border-[color-mix(in_srgb,var(--dm-success)_28%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-success)_8%,white)] px-2 py-2.5 text-center">
                  <p className="text-[10px] font-semibold uppercase tracking-wide text-dm-muted">Month</p>
                  <p className="mt-1 min-w-0 break-words text-[11px] font-bold leading-tight text-[color-mix(in_srgb,var(--dm-success)_88%,var(--dm-text)_12%)]">
                    {formatMoneySafe(globalMonthSpend, dominantCurrency)}
                  </p>
                </div>
              </div>
            </>
          )}
        </section>
      : null}

      {tab === "expenses" ?
        <ul className="flex flex-col gap-2">
          {!hasHouseholds ?
            <li className="rounded-2xl border border-dashed border-[var(--dm-border-strong)] px-4 py-6 text-center text-[14px] text-dm-muted">
              No homes yet.
            </li>
          : (
            houses.map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/household/${r.id}?view=expenses`}
                  className="touch-manipulation flex min-h-[56px] flex-col gap-1 rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface px-4 py-3.5 shadow-sm active:scale-[0.99] active:bg-dm-elevated/50"
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-semibold text-dm-text">{r.name}</span>
                    <span className="shrink-0 rounded-full bg-dm-surface-mid px-2 py-0.5 text-[10px] font-semibold uppercase text-dm-muted">
                      {r.role}
                    </span>
                  </div>
                  <p className="text-[12px] text-dm-muted">{r.whoOwes}</p>
                  <p className="min-w-0 break-words text-[15px] font-semibold tabular-nums text-dm-text">
                    {r.balanceError ? "Could not load" : r.balanceLabel}
                  </p>
                  <p className="text-[11px] text-dm-muted">
                    {r.pendingCount} open · {r.settledCount} settled
                  </p>
                </Link>
              </li>
            ))
          )}
        </ul>
      : null}

      {tab === "receipts" ?
        <ul className="flex flex-col gap-2">
          {receipts.length === 0 ?
            <li className="rounded-2xl border border-dashed border-[var(--dm-border-strong)] px-4 py-6 text-center text-[14px] text-dm-muted">
              No receipts yet.
            </li>
          : (
            receipts.slice(0, 12).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/dashboard/household/${r.householdId}?view=receipts`}
                  className="touch-manipulation flex min-h-[52px] flex-col gap-0.5 rounded-2xl border border-[var(--dm-border)] bg-[linear-gradient(180deg,#fffefb_0%,#faf6ef_100%)] px-3.5 py-3 shadow-sm active:scale-[0.99]"
                >
                  <span className="font-semibold text-dm-text">{r.merchant?.trim() || "Receipt"}</span>
                  <span className="text-[12px] text-dm-muted">
                    {r.householdName} · {r.savedByLabel}
                  </span>
                  <span className="min-w-0 break-all text-[13px] font-semibold tabular-nums text-[color-mix(in_srgb,var(--dm-success)_85%,var(--dm-text)_15%)]">
                    {r.totalAmount !== null ? formatMoneySafe(r.totalAmount, r.currency) : "Pending"}
                  </span>
                </Link>
              </li>
            ))
          )}
        </ul>
      : null}

      {tab === "settle" ?
        <section className="space-y-3">
          {!focusPulse ?
            <p className="rounded-2xl border border-dashed border-[var(--dm-border-strong)] px-4 py-6 text-center text-[14px] text-dm-muted">
              Open a home from Overview to settle bills there.
            </p>
          : (
            <>
              <div className="rounded-2xl border border-[color-mix(in_srgb,var(--dm-social)_25%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-social)_9%,white)] p-4">
                <p className="text-[11px] font-bold uppercase tracking-wide text-dm-muted">Primary home</p>
                <p className="mt-3 min-w-0 break-words text-sm font-semibold leading-snug text-dm-text">{focusPulse.whoOwes}</p>
                <div className="mt-4 flex gap-3">
                  <div className="flex-1 rounded-xl border border-[var(--dm-border)] bg-white/85 px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase text-dm-muted">Open</p>
                    <p className="text-lg font-bold tabular-nums">{focusPulse.pendingCount}</p>
                  </div>
                  <div className="flex-1 rounded-xl border border-[var(--dm-border)] bg-white/85 px-3 py-2 text-center">
                    <p className="text-[10px] font-semibold uppercase text-dm-muted">Settled</p>
                    <p className="text-lg font-bold tabular-nums text-[color-mix(in_srgb,var(--dm-success)_88%,var(--dm-text)_12%)]">
                      {focusPulse.settledCount}
                    </p>
                  </div>
                </div>
              </div>
              <Link
                href={`/dashboard/household/${focusPulse.householdId}?view=expenses`}
                className="dm-focus-ring flex min-h-[48px] items-center justify-center rounded-2xl bg-dm-electric px-4 text-[15px] font-bold text-white shadow-[0_10px_24px_rgba(200,104,69,0.28)] active:brightness-95"
              >
                Open ledger & settle
              </Link>
            </>
          )}
        </section>
      : null}
    </div>
  );
}
