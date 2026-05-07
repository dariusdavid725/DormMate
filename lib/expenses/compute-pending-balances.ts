import type {
  BalanceRow,
  ExpenseSplitPart,
  HouseholdExpenseRow,
} from "@/lib/expenses/queries";

export type BalanceSection = {
  currency: string;
  balances: BalanceRow[];
};

/**
 * Mirrors pending-expense math used in `household_expense_net_balances`, grouped by currency.
 */
export function computePendingBalanceSections(
  expenses: HouseholdExpenseRow[],
  splitPartsByExpenseId: Map<string, ExpenseSplitPart[]>,
): BalanceSection[] {
  const perCurrency = new Map<string, Map<string, number>>();

  for (const e of expenses) {
    if (e.status !== "pending") continue;
    const parts = splitPartsByExpenseId.get(e.id) ?? [];
    if (parts.length === 0) continue;

    const sumW = parts.reduce((s, p) => s + p.weight, 0);
    if (sumW <= 0) continue;

    const cur = (e.currency || "EUR").toUpperCase().slice(0, 8);

    let users = perCurrency.get(cur);
    if (!users) {
      users = new Map();
      perCurrency.set(cur, users);
    }

    for (const p of parts) {
      const share = e.amount * (p.weight / sumW);
      users.set(p.userId, (users.get(p.userId) ?? 0) - share);
    }
    users.set(
      e.paidByUserId,
      (users.get(e.paidByUserId) ?? 0) + e.amount,
    );
  }

  const sections: BalanceSection[] = [];
  for (const [currency, userMap] of perCurrency) {
    const balances = [...userMap.entries()]
      .map(([userId, netAmount]) => ({ userId, netAmount }))
      .filter((b) => Math.abs(b.netAmount) > 0.005)
      .sort((a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount));
    if (balances.length > 0) {
      sections.push({ currency, balances });
    }
  }

  sections.sort((a, b) => a.currency.localeCompare(b.currency));
  return sections;
}
