import { SettleExpenseForm } from "@/components/expenses/settle-expense-form";

import type {
  ExpenseSplitPart,
  HouseholdExpenseRow,
} from "@/lib/expenses/queries";
import { formatMoneySafe } from "@/lib/currency/format-money";

function fmtDate(val: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(`${val}T12:00:00`),
    );
  } catch {
    return val;
  }
}

function formatSplitParts(
  parts: ExpenseSplitPart[],
  labels: Record<string, string>,
): string {
  if (!parts.length) return "—";
  const sumW = parts.reduce((s, p) => s + p.weight, 0);
  if (sumW <= 0) return "—";
  const equal = parts.every(
    (p) => Math.abs(p.weight - parts[0].weight) < 0.000001 * Math.max(sumW, 1),
  );
  if (equal) {
    return parts.map((p) => labels[p.userId]?.trim() ?? "Housemate").join(", ");
  }
  return parts
    .map((p) => {
      const pct = Math.round((p.weight / sumW) * 1000) / 10;
      const name = labels[p.userId]?.trim() ?? "Housemate";
      return `${name} (${pct}%)`;
    })
    .join(", ");
}

export function HouseholdExpenseList({
  householdId,
  expenses,
  splitPartsByExpenseId,
  memberLabels,
}: {
  householdId: string;
  expenses: HouseholdExpenseRow[];
  splitPartsByExpenseId: Map<string, ExpenseSplitPart[]>;
  memberLabels: Record<string, string>;
}) {
  if (!expenses.length) {
    return (
      <p className="mt-6 text-[13px] text-dm-muted">
        No expenses yet — add one above, or scan a receipt under Receipts and turn it into a split.
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {expenses.map((e) => {
        const parts = splitPartsByExpenseId.get(e.id) ?? [];
        const payer = memberLabels[e.paidByUserId] ?? "Housemate";
        const splitSummary = formatSplitParts(parts, memberLabels);
        const settled = e.status === "settled";

        return (
          <li
            key={e.id}
            className="cozy-receipt cozy-tilt-xs rounded-[2px] px-4 py-3 max-lg:rounded-xl max-lg:px-4 max-lg:py-4"
          >
            <div className="flex min-w-0 flex-wrap items-start justify-between gap-3 max-lg:flex-col max-lg:gap-4">
              <div className="min-w-0 max-w-full flex-1">
                <p className="break-words font-semibold text-dm-text">{e.title}</p>
                <p className="mt-2 break-words text-[13px] leading-relaxed text-dm-muted max-lg:text-[14px]">
                  {fmtDate(e.expenseDate)} · paid by{" "}
                  <span className="text-dm-text">{payer}</span>
                  <span className="mx-2 opacity-40 max-lg:hidden">·</span>
                  <span className="max-lg:mt-1 max-lg:block lg:inline">
                    shares: {splitSummary}
                  </span>
                </p>
                <p className="mt-2 text-[11px] font-semibold uppercase tracking-wide text-dm-muted max-lg:text-[12px] max-lg:normal-case max-lg:tracking-normal">
                  {settled
                    ? "Closed — no longer affects balances"
                    : "Open — counts in “who owes who” above"}
                </p>
              </div>
              <div className="flex w-full shrink-0 flex-col items-end gap-2 max-lg:w-full max-lg:items-start">
                <span className="font-mono text-lg font-semibold tabular-nums text-dm-text">
                  {formatMoneySafe(e.amount, e.currency)}
                </span>
                {!settled ? (
                  <SettleExpenseForm
                    householdId={householdId}
                    expenseId={e.id}
                  />
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
