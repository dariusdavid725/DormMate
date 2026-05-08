import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MoneyMobileTabs } from "@/components/mobile/money-mobile-tabs";
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
  const focusHousehold = rows[0] ?? null;
  const balanceOverview = focusRows.map((r) => r.balanceLabel).join(" · ") || "Even";
  const mobileHouses = rows.map((r) => ({
    id: r.id,
    name: r.name,
    role: r.role,
    balanceLabel: r.balanceLabel,
    balanceError: !!r.balanceError,
    pendingCount: r.pendingCount,
    settledCount: r.settledCount,
    whoOwes: r.whoOwes,
  }));
  const mobileReceipts = receiptsPreview.map((r) => ({
    id: r.id,
    householdId: r.householdId,
    merchant: r.merchant,
    householdName: r.householdName,
    savedByLabel: r.savedByLabel,
    totalAmount: r.totalAmount,
    currency: r.currency,
  }));
  const focusPulse =
    focusHousehold ?
      {
        householdId: focusHousehold.id,
        pendingCount: focusHousehold.pendingCount,
        settledCount: focusHousehold.settledCount,
        whoOwes: focusHousehold.whoOwes,
      }
    : null;

  return (
    <div className="dm-page-enter mx-auto flex min-h-0 w-full max-w-[1240px] flex-1 flex-col overflow-hidden lg:block lg:flex-none lg:space-y-7 lg:overflow-visible">
      <header className="dm-money-page-hero dm-module-depth relative hidden overflow-hidden px-6 pb-7 pt-6 lg:block lg:px-10 lg:pb-8 lg:pt-7">
        <span
          className="dm-ambient-drift pointer-events-none absolute -right-16 top-6 h-44 w-44 rounded-full border border-[color-mix(in_srgb,var(--dm-info)_28%,transparent)] bg-[radial-gradient(circle_at_40%_35%,rgba(78,120,168,0.14),transparent_68%)] opacity-80"
          aria-hidden
        />
        <span
          className="dm-ambient-drift-rev pointer-events-none absolute -left-10 bottom-4 h-36 w-48 rotate-6 rounded-[2.5rem] bg-[linear-gradient(135deg,rgba(208,106,74,0.12),transparent)]"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-start justify-between gap-6">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="dm-chip dm-chip-accent">Money hub</span>
              <span className="dm-chip border-[color-mix(in_srgb,var(--dm-info)_26%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-info)_7%,white)]">
                Roommate-safe splits
              </span>
            </div>
            <h1 className="mt-4 text-[2rem] font-semibold leading-[1.08] tracking-tight text-dm-text lg:text-[2.65rem]">
              Money that feels fair, not frantic
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dm-muted">
              Balances, receipts, and who-settled-what—kept human so nobody has to be the “finance admin” forever.
            </p>
          </div>
          <div className="dm-stagger-metrics grid min-w-0 w-full max-w-[min(100%,22rem)] shrink-0 grid-cols-2 gap-2">
            <div className="dm-hover-lift dm-interactive dm-settle-chip rounded-xl border border-[var(--dm-border)] bg-white/70 px-3 py-2 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
              <p className="text-[11px] uppercase tracking-wide text-dm-muted">Pending bills</p>
              <p className="dm-value-settle text-lg font-semibold tabular-nums text-dm-text">{globalPending}</p>
            </div>
            <div className="dm-hover-lift dm-interactive dm-settle-chip rounded-xl border border-[var(--dm-border)] bg-white/70 px-3 py-2 shadow-[0_1px_0_rgba(255,255,255,0.9)_inset]">
              <p className="text-[11px] uppercase tracking-wide text-dm-muted">Settled</p>
              <p className="dm-value-settle text-lg font-semibold tabular-nums text-dm-text">{globalSettled}</p>
            </div>
            <div className="dm-hover-lift dm-interactive dm-settle-chip rounded-xl border border-[color-mix(in_srgb,var(--dm-success)_28%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-success)_7%,white)] px-3 py-2 shadow-[0_1px_0_rgba(255,255,255,0.85)_inset]">
              <p className="text-[11px] uppercase tracking-wide text-dm-muted">Month spending</p>
              <p className="dm-value-settle break-words text-sm font-semibold leading-snug text-[color-mix(in_srgb,var(--dm-success)_92%,var(--dm-text)_8%)]">
                {formatMoneySafe(globalMonthSpend, dominantCurrency)}
              </p>
            </div>
            <div className="dm-hover-lift dm-interactive dm-settle-chip col-span-2 min-w-0 rounded-xl border border-[color-mix(in_srgb,var(--dm-social)_36%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-social)_8%,white)] px-3 py-2 shadow-[0_1px_0_rgba(255,255,255,0.88)_inset]">
              <p className="text-[11px] uppercase tracking-wide text-dm-muted">Open balance</p>
              <p className="dm-value-settle mt-0.5 min-w-0 break-words text-xs font-semibold leading-relaxed text-dm-text">
                {focusRows.map((r) => r.balanceLabel).join(" · ") || "Even"}
              </p>
            </div>
          </div>
        </div>
      </header>

      {error ?
        <div className="shrink-0 rounded-lg border border-dm-danger/35 px-4 py-3 text-sm text-dm-danger">
          {error}
        </div>
      : null}

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden px-0.5 pt-0.5 lg:hidden">
        <header className="shrink-0 border-b border-[color-mix(in_srgb,var(--dm-border-strong)_75%,transparent)] pb-1.5">
          <h1 className="text-[1.2rem] font-bold leading-tight tracking-tight text-dm-text">Money</h1>
          <p className="line-clamp-1 text-[11px] text-dm-muted">Balances · receipts · settle</p>
        </header>
        <MoneyMobileTabs
          houses={mobileHouses}
          receipts={mobileReceipts}
          focusPulse={focusPulse}
          dominantCurrency={dominantCurrency}
          globalPending={globalPending}
          globalSettled={globalSettled}
          globalMonthSpend={globalMonthSpend}
          balanceOverview={balanceOverview}
          hasHouseholds={households.length > 0}
        />
      </div>

      <div className="hidden gap-5 lg:grid lg:grid-cols-12">
        <section className="dm-money-ledger dm-scroll-reveal dm-scroll-reveal-slow dm-module-depth col-span-7 overflow-hidden p-5">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
            <h2 className="dm-section-heading">Open balances</h2>
            <span className="dm-chip border-[color-mix(in_srgb,var(--dm-info)_22%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-info)_6%,white)]">
              {rows.length} homes
            </span>
          </div>
          <div className="divide-y divide-[var(--dm-border)] rounded-xl border border-[var(--dm-border-strong)] bg-white/80">
            {rows.map((r) => (
              <article key={r.id} className="dm-money-ledger-row dm-tactile-row px-3.5 py-3.5 first:rounded-t-xl last:rounded-b-xl hover:bg-[color-mix(in_srgb,var(--dm-info)_6%,white)]">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-dm-text">{r.name}</p>
                    <p className="mt-1 text-[12px] text-dm-muted">{r.whoOwes}</p>
                  </div>
                  <span className="max-w-[min(11rem,calc(100vw-480px))] min-w-0 break-words text-right text-sm font-semibold tabular-nums leading-snug text-dm-text">
                    {r.balanceLabel}
                  </span>
                </div>
                <div className="mt-2 flex items-center justify-between text-[12px] text-dm-muted">
                  <span>
                    {r.pendingCount} pending · {r.settledCount} settled
                  </span>
                  <Link href={`/dashboard/household/${r.id}?view=expenses`} className="font-semibold text-dm-electric hover:underline">
                    Open ledger
                  </Link>
                </div>
              </article>
            ))}
            {rows.length === 0 ?
              <p className="px-3.5 py-6 text-center text-sm text-dm-muted">Create a home to start shared money.</p>
            : null}
          </div>
        </section>

        <section className="dm-scroll-reveal dm-scroll-reveal-slow relative col-span-5 overflow-hidden rounded-[18px] border border-[var(--dm-border-strong)] bg-[linear-gradient(180deg,#fffdfb_0%,#f4f1ea_100%)] p-5 shadow-[0_14px_32px_rgba(45,41,37,0.07)]">
          <span
            className="dm-ambient-drift pointer-events-none absolute right-3 top-3 h-16 w-16 rounded-full border border-dashed border-[color-mix(in_srgb,var(--dm-electric)_35%,transparent)] opacity-60"
            aria-hidden
          />
          <div className="relative mb-3 flex items-center justify-between gap-2">
            <h2 className="dm-section-heading">Receipt desk</h2>
            <span className="dm-chip">Fresh pulls</span>
          </div>
          <ul className="dm-fin-receipt-stack space-y-2.5">
            {receiptsPreview.slice(0, 6).map((r) => (
              <li key={r.id} className="cozy-receipt dm-tactile-receipt px-3 py-2.5">
                <p className="truncate text-sm font-semibold text-dm-text">{r.merchant || "Receipt"}</p>
                <p className="mt-0.5 text-[12px] text-dm-muted">
                  {r.householdName} · {r.savedByLabel}
                </p>
                <p className="mt-1 min-w-0 select-all text-[12px] font-semibold tabular-nums text-[color-mix(in_srgb,var(--dm-success)_88%,var(--dm-text)_12%)]">
                  {r.totalAmount !== null ? (
                    <span className="inline-block max-w-full break-all">{formatMoneySafe(r.totalAmount, r.currency)}</span>
                  ) : (
                    "Amount pending"
                  )}
                </p>
              </li>
            ))}
            {receiptsPreview.length === 0 ?
              <li className="rounded-xl border border-dashed border-[var(--dm-border-strong)] px-3 py-5 text-center text-sm text-dm-muted">
                No receipts saved yet.
              </li>
            : null}
          </ul>
        </section>
      </div>

      {focusHousehold ? (
        <section className="dm-scroll-reveal dm-scroll-reveal-slow hidden gap-5 lg:grid lg:grid-cols-12">
          <div className="col-span-8">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
              <h2 className="dm-section-heading">Recent ledger lines</h2>
              <Link
                href={`/dashboard/household/${focusHousehold.id}?view=expenses`}
                className="text-sm font-semibold text-dm-electric underline decoration-dm-electric/35 underline-offset-2 hover:text-dm-text"
              >
                Open full settlements
              </Link>
            </div>
            <div className="rounded-[18px] border border-[var(--dm-border-strong)] bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(247,248,251,0.98)_100%)] p-4 shadow-[0_12px_28px_rgba(28,39,56,0.06)]">
              <HouseholdExpenseList
                householdId={focusHousehold.id}
                expenses={focusHousehold.expenses.slice(0, 5)}
                splitPartsByExpenseId={focusHousehold.splitMap}
                memberLabels={focusHousehold.memberLabels}
              />
            </div>
          </div>
          <div className="col-span-4 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="dm-section-heading">Settlement pulse</h2>
              <span className="dm-chip dm-chip-accent">This season</span>
            </div>
            <div className="rounded-[18px] border border-[color-mix(in_srgb,var(--dm-social)_22%,var(--dm-border-strong))] bg-[linear-gradient(200deg,color-mix(in_srgb,var(--dm-social)_7%,white)_0%,#fffefb_52%)] p-4 shadow-[0_14px_30px_rgba(28,39,56,0.07)]">
              <div className="dm-stagger-settle grid gap-2">
                <div className="dm-hover-lift dm-settle-chip rounded-xl border border-[var(--dm-border)] bg-white/85 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">Pending</p>
                  <p className="dm-value-settle mt-1 text-xl font-semibold tabular-nums text-dm-text">{focusHousehold.pendingCount}</p>
                </div>
                <div className="dm-hover-lift dm-settle-chip rounded-xl border border-[color-mix(in_srgb,var(--dm-success)_30%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-success)_9%,white)] px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">Settled</p>
                  <p className="dm-value-settle mt-1 text-xl font-semibold tabular-nums text-[color-mix(in_srgb,var(--dm-success)_90%,var(--dm-text)_10%)]">
                    {focusHousehold.settledCount}
                  </p>
                </div>
                <div className="dm-hover-lift dm-settle-chip rounded-xl border border-[var(--dm-border)] bg-white/80 px-3 py-3">
                  <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">Who owes whom</p>
                  <p className="dm-value-settle mt-1 min-w-0 break-words text-sm font-semibold leading-snug text-dm-text">
                    {focusHousehold.whoOwes}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
