import { settleHouseholdExpense } from "@/lib/expenses/actions";

import type { HouseholdExpenseRow } from "@/lib/expenses/queries";

function fmtMoney(n: number, cur: string) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur || "EUR",
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${cur}`;
  }
}

function fmtDate(val: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(
      new Date(`${val}T12:00:00`),
    );
  } catch {
    return val;
  }
}

export function HouseholdExpenseList({
  householdId,
  expenses,
  splitUserIdsByExpenseId,
  memberLabels,
}: {
  householdId: string;
  expenses: HouseholdExpenseRow[];
  splitUserIdsByExpenseId: Map<string, string[]>;
  memberLabels: Record<string, string>;
}) {
  if (!expenses.length) {
    return (
      <p className="mt-6 text-[13px] text-dm-muted">
        Nothing logged yet — add a slip above!
      </p>
    );
  }

  return (
    <ul className="mt-6 space-y-3">
      {expenses.map((e) => {
        const splits = splitUserIdsByExpenseId.get(e.id) ?? [];
        const payer = memberLabels[e.paidByUserId] ?? "mate";
        const splitNames =
          splits
            .map((id) => memberLabels[id]?.trim())
            .filter(Boolean)
            .join(", ") || "—";
        const settled = e.status === "settled";

        return (
          <li
            key={e.id}
            className="cozy-receipt cozy-tilt-xs rounded-[2px] px-4 py-3"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-dm-text">{e.title}</p>
                <p className="mt-1 text-[13px] text-dm-muted">
                  {fmtDate(e.expenseDate)} · paid by{" "}
                  <span className="text-dm-text">{payer}</span>
                  <span className="mx-2 opacity-40">·</span>
                  split with {splitNames}
                </p>
                <p className="mt-1 text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
                  {settled ? "Settled · archived totals" : "Pending · rolls into balances"}
                </p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-2">
                <span className="font-mono text-lg font-semibold tabular-nums text-dm-text">
                  {fmtMoney(e.amount, e.currency)}
                </span>
                {!settled ? (
                  <form action={settleHouseholdExpense}>
                    <input type="hidden" name="household_id" value={householdId} />
                    <input type="hidden" name="expense_id" value={e.id} />
                    <button
                      type="submit"
                      className="rounded-md border border-dashed border-[var(--dm-border-strong)] px-3 py-1.5 text-[11px] font-semibold text-dm-muted hover:border-dm-electric hover:text-dm-electric"
                    >
                      Mark settled
                    </button>
                  </form>
                ) : null}
              </div>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
