import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileListItem } from "@/components/mobile/mobile-list-item";
import { MobileSection } from "@/components/mobile/mobile-section";
import { formatMoneySafe } from "@/lib/currency/format-money";
import { computePendingBalanceSections } from "@/lib/expenses/compute-pending-balances";
import {
  loadExpenseSplits,
  loadHouseholdExpenses,
} from "@/lib/expenses/queries";
import { HouseholdExpenseList } from "@/components/expenses/household-expense-list";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { loadHouseholdMembers } from "@/lib/households/queries";
import { loadReceiptFeedPreview } from "@/lib/receipts/feed-queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Money",
};

export default async function FinancesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/finances");
  }

  const { households, error } = await loadHouseholdSummaries(user.id);
  const { items: receiptsPreview } = await loadReceiptFeedPreview(households, 12);

  const rows = await Promise.all(
    households.map(async (h) => {
      const { expenses, error: expErr } = await loadHouseholdExpenses(h.id);
      const pending = expenses.filter((e) => e.status === "pending");
      const { byExpense, error: splitErr } = await loadExpenseSplits(
        pending.map((e) => e.id),
      );
      const sections = computePendingBalanceSections(pending, byExpense);
      const members = await loadHouseholdMembers(h.id);
      const memberLabelMap = new Map(
        Array.isArray(members)
          ? members.map((m) => [m.userId, m.displayName?.trim() || m.email?.trim() || "Roommate"] as const)
          : [],
      );
      const nets = new Map<string, number>();
      for (const sec of sections) {
        const mine = sec.balances.find((b) => b.userId === user.id);
        if (!mine) continue;
        const cur = (h.currency || sec.currency || "RON").toUpperCase();
        nets.set(cur, (nets.get(cur) ?? 0) + mine.netAmount);
      }
      const parts = [...nets.entries()]
        .filter(([, n]) => Math.abs(n) >= 0.005)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cur, n]) => formatMoneySafe(n, cur));

      const topWho = sections
        .flatMap((sec) => {
          const debtor = sec.balances.find((b) => b.netAmount < 0);
          const creditor = sec.balances.find((b) => b.netAmount > 0);
          if (!debtor || !creditor) return [];
          const from = memberLabelMap.get(debtor.userId) ?? "Roommate";
          const to = memberLabelMap.get(creditor.userId) ?? "Roommate";
          return [`${from} owes ${to} (${sec.currency})`];
        })
        .slice(0, 1)[0] ?? "No pending owes right now";

      const monthSpend = expenses
        .filter((e) => {
          const d = new Date(`${e.expenseDate}T00:00:00`);
          const now = new Date();
          return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
        })
        .reduce((sum, e) => sum + e.amount, 0);

      return {
        id: h.id,
        name: h.name,
        role: h.role,
        currency: h.currency,
        expenses,
        splitMap: byExpense,
        memberLabels: Object.fromEntries(memberLabelMap.entries()),
        pendingCount: pending.length,
        settledCount: expenses.filter((e) => e.status === "settled").length,
        monthSpend,
        whoOwes: topWho,
        balanceLabel:
          expErr || splitErr ? "—"
          : parts.length ? parts.join(" · ")
          : "Even",
        balanceError: expErr ?? splitErr,
      };
    }),
  );

  const globalPending = rows.reduce((s, r) => s + r.pendingCount, 0);
  const globalSettled = rows.reduce((s, r) => s + r.settledCount, 0);
  const globalMonthSpend = rows.reduce((s, r) => s + r.monthSpend, 0);
  const dominantCurrency = households[0]?.currency ?? "RON";
  const focusRows = rows.slice(0, 3);

  return (
    <div className="mx-auto w-full max-w-[1240px] space-y-7">
      <header className="dm-hero-module dm-module-depth overflow-hidden px-6 pb-6 pt-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="min-w-0">
            <div className="dm-chip dm-chip-accent">Money hub</div>
            <h1 className="mt-3 text-[1.95rem] font-semibold tracking-tight text-dm-text lg:text-[2.5rem]">
              Shared money, clearly organized
            </h1>
            <p className="mt-2 max-w-2xl text-[14px] text-dm-muted">
              Open balances, who owes whom, receipts, and settlement progress in one place.
            </p>
          </div>
          <div className="grid min-w-[230px] grid-cols-2 gap-2">
            <div className="rounded-xl border border-[var(--dm-border)] bg-white/65 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-dm-muted">Pending bills</p>
              <p className="text-lg font-semibold text-dm-text">{globalPending}</p>
            </div>
            <div className="rounded-xl border border-[var(--dm-border)] bg-white/65 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-dm-muted">Settled</p>
              <p className="text-lg font-semibold text-dm-text">{globalSettled}</p>
            </div>
            <div className="rounded-xl border border-[var(--dm-border)] bg-white/65 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-dm-muted">Month spending</p>
              <p className="text-sm font-semibold text-emerald-700">
                {formatMoneySafe(globalMonthSpend, dominantCurrency)}
              </p>
            </div>
            <div className="rounded-xl border border-[var(--dm-border)] bg-white/65 px-3 py-2">
              <p className="text-[11px] uppercase tracking-wide text-dm-muted">Open balance</p>
              <p className="text-sm font-semibold text-dm-text">
                {focusRows.map((r) => r.balanceLabel).join(" · ") || "Even"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {error ?
        <div className="rounded-lg border border-dm-danger/35 px-4 py-3 text-sm text-dm-danger">
          {error}
        </div>
      : null}

      <div className="lg:hidden">
        <MobileSection
          title="Money summary"
          hideDescriptionMobile
          description="Across homes"
          className="border-[var(--dm-border-strong)] shadow-[var(--cozy-shadow-note)]"
        >
          {households.length === 0 ?
            <p className="text-[14px] text-dm-muted">
              Create a home from{" "}
              <Link className="font-semibold text-dm-electric hover:underline" href="/dashboard">
                Home
              </Link>
              .
            </p>
          : (
            <ul className="flex flex-col gap-2">
              {rows.map((r) => (
                <li key={r.id}>
                  <MobileListItem
                    title={r.name}
                    subtitle={`Role · ${r.role}`}
                    meta={
                      r.balanceError ?
                        <span className="text-dm-muted">Could not load balance</span>
                      : r.balanceLabel
                    }
                    href={`/dashboard/household/${r.id}?view=expenses`}
                    trailing={
                      <span className="text-[12px] font-semibold text-dm-electric">Ledger</span>
                    }
                  />
                </li>
              ))}
            </ul>
          )}
        </MobileSection>
      </div>

      <div className="hidden gap-4 lg:grid lg:grid-cols-12">
        <section className="dm-module dm-module-depth col-span-7 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="dm-section-heading">Open balances</h2>
            <span className="dm-chip">{rows.length} homes</span>
          </div>
          <div className="space-y-3">
            {rows.map((r) => (
              <article key={r.id} className="rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/35 px-3.5 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-dm-text">{r.name}</p>
                    <p className="mt-1 text-[12px] text-dm-muted">{r.whoOwes}</p>
                  </div>
                  <span className="text-right font-mono text-sm font-semibold text-dm-text">{r.balanceLabel}</span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-dm-muted">
                  <span>{r.pendingCount} pending · {r.settledCount} settled</span>
                  <Link href={`/dashboard/household/${r.id}?view=expenses`} className="font-semibold text-dm-electric hover:underline">
                    Open ledger
                  </Link>
                </div>
              </article>
            ))}
            {rows.length === 0 ? <p className="text-sm text-dm-muted">Create a home to start shared money.</p> : null}
          </div>
        </section>

        <section className="dm-module dm-module-depth col-span-5 p-5">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="dm-section-heading">Recent receipts</h2>
            <span className="dm-chip">visual feed</span>
          </div>
          <ul className="space-y-2">
            {receiptsPreview.slice(0, 6).map((r) => (
              <li key={r.id} className="rounded-xl border border-[var(--dm-border)] bg-[linear-gradient(180deg,#fffefb_0%,#faf6ef_100%)] px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-dm-text">{r.merchant || "Receipt"}</p>
                <p className="mt-0.5 text-[12px] text-dm-muted">{r.householdName} · {r.savedByLabel}</p>
                <p className="mt-1 text-[12px] font-semibold text-emerald-700">
                  {r.totalAmount !== null ? formatMoneySafe(r.totalAmount, r.currency) : "Amount pending"}
                </p>
              </li>
            ))}
            {receiptsPreview.length === 0 ? <li className="text-sm text-dm-muted">No receipts saved yet.</li> : null}
          </ul>
        </section>
      </div>

      {rows[0] ? (
        <section className="hidden lg:block">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="dm-section-heading">Recent expenses</h2>
            <Link href={`/dashboard/household/${rows[0].id}?view=expenses`} className="text-sm font-semibold text-dm-electric hover:underline">
              Open full settlements
            </Link>
          </div>
          <div className="dm-module p-4">
            <HouseholdExpenseList
              householdId={rows[0].id}
              expenses={rows[0].expenses.slice(0, 5)}
              splitPartsByExpenseId={rows[0].splitMap}
              memberLabels={rows[0].memberLabels}
            />
          </div>
        </section>
      ) : null}
    </div>
  );
}
