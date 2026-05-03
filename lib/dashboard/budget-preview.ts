import "server-only";

import { loadHouseholdExpenseBalances } from "@/lib/expenses/queries";
import type { HouseholdSummary } from "@/lib/households/queries";

function formatEuro(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `€${n.toFixed(2)}`;
  }
}

/**
 * Sum of your net balances across households (pending expenses only).
 * Positive ⇒ others owe you on paper; negative ⇒ you owe the group overall.
 */
export async function loadUserCrossHouseholdNetLabel(
  userId: string,
  households: HouseholdSummary[],
): Promise<{ label: string; error?: string | null }> {
  if (households.length === 0) {
    return { label: formatEuro(0) };
  }

  let sum = 0;
  let err: string | null = null;
  for (const h of households) {
    const { balances, error } = await loadHouseholdExpenseBalances(h.id);
    if (error) err = error;
    const mine = balances.find((b) => b.userId === userId);
    sum += mine?.netAmount ?? 0;
  }

  return { label: formatEuro(sum), error: err };
}
