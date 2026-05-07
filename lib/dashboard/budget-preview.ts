import "server-only";

import { formatMoneySafe } from "@/lib/currency/format-money";
import { computePendingBalanceSections } from "@/lib/expenses/compute-pending-balances";
import {
  loadExpenseSplits,
  loadHouseholdExpenses,
} from "@/lib/expenses/queries";
import type { HouseholdSummary } from "@/lib/households/queries";

/**
 * Sum of your net balances across households (pending expenses only), grouped by currency.
 */
export async function loadUserCrossHouseholdNetLabel(
  userId: string,
  households: HouseholdSummary[],
): Promise<{ label: string; error?: string | null }> {
  if (households.length === 0) {
    return { label: "Even" };
  }

  const netsByCurrency = new Map<string, number>();
  let err: string | null = null;

  for (const h of households) {
    const { expenses, error: expErr } = await loadHouseholdExpenses(h.id);
    if (expErr) err = expErr;
    const pending = expenses.filter((e) => e.status === "pending");
    if (!pending.length) continue;

    const { byExpense, error: splitErr } = await loadExpenseSplits(
      pending.map((e) => e.id),
    );
    if (splitErr) err = splitErr;

    const sections = computePendingBalanceSections(pending, byExpense);
    for (const sec of sections) {
      const mine = sec.balances.find((b) => b.userId === userId);
      if (!mine) continue;
      const cur = sec.currency.toUpperCase();
      netsByCurrency.set(cur, (netsByCurrency.get(cur) ?? 0) + mine.netAmount);
    }
  }

  if (netsByCurrency.size === 0) {
    return { label: "Even", error: err };
  }

  const parts = [...netsByCurrency.entries()]
    .filter(([, n]) => Math.abs(n) >= 0.005)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([cur, n]) => formatMoneySafe(n, cur));

  if (parts.length === 0) {
    return { label: "Even", error: err };
  }

  return { label: parts.join(" · "), error: err };
}
