import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { formatMoneySafe } from "@/lib/currency/format-money";
import { computePendingBalanceSections } from "@/lib/expenses/compute-pending-balances";
import {
  loadExpenseSplits,
  loadHouseholdExpenses,
} from "@/lib/expenses/queries";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finances",
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

  const rows = await Promise.all(
    households.map(async (h) => {
      const { expenses, error: expErr } = await loadHouseholdExpenses(h.id);
      const pending = expenses.filter((e) => e.status === "pending");
      const { byExpense, error: splitErr } = await loadExpenseSplits(
        pending.map((e) => e.id),
      );
      const sections = computePendingBalanceSections(pending, byExpense);
      const nets = new Map<string, number>();
      for (const sec of sections) {
        const mine = sec.balances.find((b) => b.userId === user.id);
        if (!mine) continue;
        nets.set(
          sec.currency.toUpperCase(),
          (nets.get(sec.currency.toUpperCase()) ?? 0) + mine.netAmount,
        );
      }
      const parts = [...nets.entries()]
        .filter(([, n]) => Math.abs(n) >= 0.005)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([cur, n]) => formatMoneySafe(n, cur));

      return {
        id: h.id,
        name: h.name,
        role: h.role,
        balanceLabel:
          expErr || splitErr ? "—"
          : parts.length ? parts.join(" · ")
          : "Even",
        balanceError: expErr ?? splitErr,
      };
    }),
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-24 lg:pb-9">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-6">
        <h1 className="font-cozy-display text-[2.35rem] leading-[1.1] text-dm-text">
          Expenses overview
        </h1>
        <p className="mt-2 max-w-xl text-[13px] text-dm-muted">
          Your share of open bills only (same math as each household’s Money tab). Use the real
          currency saved on each expense — Ron receipts stay in RON.
        </p>
      </header>

      {error ?
        <div className="rounded-lg border border-dm-danger/35 px-4 py-3 text-sm text-dm-danger">
          {error}
        </div>
      : null}

      <div className="cozy-receipt cozy-tilt-xs overflow-hidden rounded-[2px]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--dm-border-strong)] bg-dm-bg text-[11px] font-medium uppercase tracking-wide text-dm-muted">
            <tr>
              <th className="px-5 py-3.5">Household</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5 tabular-nums text-dm-text">Your balance (open bills)</th>
              <th className="hidden px-5 py-3.5 sm:table-cell">Open ledger</th>
            </tr>
          </thead>
          <tbody>
            {households.length === 0 ?
              <tr>
                <td className="px-5 py-12 text-center text-dm-muted" colSpan={4}>
                  Create a household from{" "}
                  <Link className="text-dm-electric hover:underline" href="/dashboard">
                    Home
                  </Link>
                  .
                </td>
              </tr>
            : rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--dm-border)] transition-colors last:border-b-0 hover:bg-[color-mix(in_srgb,var(--dm-surface-mid)_55%,transparent)]"
                >
                  <td className="px-5 py-3.5 font-medium text-dm-text">{r.name}</td>
                  <td className="px-5 py-3.5 capitalize text-dm-muted">{r.role}</td>
                  <td className="px-5 py-3.5 font-mono tabular-nums text-dm-text">
                    {r.balanceError ?
                      <span className="text-dm-muted">Could not load</span>
                    : r.balanceLabel}
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <Link
                      className="text-sm text-dm-electric hover:underline"
                      href={`/dashboard/household/${r.id}?view=expenses`}
                    >
                      Money tab
                    </Link>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <section className="cozy-note cozy-tilt-xs p-5 text-[13px] leading-relaxed text-dm-muted shadow-[var(--cozy-shadow-note)]">
        Scan receipts under each household’s Receipts tab. When you tap “Turn into split”, the split
        uses that receipt’s currency. After people pay each other outside the app, open the bill and
        tap <strong className="text-dm-text">We settled up — close bill</strong> so it stops counting.
      </section>
    </div>
  );
}
