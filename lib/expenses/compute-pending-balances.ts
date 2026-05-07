import type {
  BalanceRow,
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
  splitUserIdsByExpenseId: Map<string, string[]>,
): BalanceSection[] {
  const perCurrency = new Map<string, Map<string, number>>();

  for (const e of expenses) {
    if (e.status !== "pending") continue;
    const splits = splitUserIdsByExpenseId.get(e.id) ?? [];
    if (splits.length === 0) continue;

    const cur = (e.currency || "EUR").toUpperCase().slice(0, 8);
    const cnt = splits.length;
    const share = e.amount / cnt;

    let users = perCurrency.get(cur);
    if (!users) {
      users = new Map();
      perCurrency.set(cur, users);
    }

    for (const uid of splits) {
      users.set(uid, (users.get(uid) ?? 0) - share);
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
