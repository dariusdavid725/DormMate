import { formatMoneySafe } from "@/lib/currency/format-money";
import type { BalanceSection } from "@/lib/expenses/compute-pending-balances";

export function HouseholdNetBalances({
  sections,
  memberLabels,
}: {
  sections: BalanceSection[];
  memberLabels: Record<string, string>;
}) {
  if (!sections.length) {
    return (
      <p className="text-[13px] text-dm-muted">
        No pending bills — balances are even until someone adds an expense.
      </p>
    );
  }

  return (
    <div className="mt-4 space-y-6">
      {sections.map((sec) => (
        <div key={sec.currency}>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            {sec.currency}
          </p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {sec.balances.map((row) => {
              const nm = memberLabels[row.userId] ?? row.userId.slice(0, 6);
              const n = row.netAmount;
              const plain =
                n > 0.005
                  ? "Paid more than their share — others owe them part of this total."
                  : n < -0.005
                    ? "Owes others their share of these bills."
                    : "About even.";
              return (
                <li
                  key={`${sec.currency}-${row.userId}`}
                  className="rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/90 px-3 py-2.5"
                >
                  <p className="text-sm font-semibold text-dm-text">{nm}</p>
                  <p className="mt-1 font-mono text-lg tabular-nums text-dm-text">
                    {formatMoneySafe(n, sec.currency)}
                  </p>
                  <p className="mt-1 text-[11px] leading-snug text-dm-muted">{plain}</p>
                </li>
              );
            })}
          </ul>
        </div>
      ))}
      <p className="text-[11px] text-dm-muted">
        Numbers come only from bills still marked open. When everyone has paid,
        tap “We settled up” on each bill to clear it from this list.
      </p>
    </div>
  );
}
