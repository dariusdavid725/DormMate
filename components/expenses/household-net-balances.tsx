import type { BalanceRow } from "@/lib/expenses/queries";

function fmtMoney(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
    }).format(n);
  } catch {
    return `€${n.toFixed(2)}`;
  }
}

export function HouseholdNetBalances({
  balances,
  memberLabels,
}: {
  balances: BalanceRow[];
  memberLabels: Record<string, string>;
}) {
  const sorted = [...balances].sort(
    (a, b) => Math.abs(b.netAmount) - Math.abs(a.netAmount),
  );

  if (!sorted.length) {
    return (
      <p className="text-[13px] text-dm-muted">
        No pending expenses → everyone&apos;s even for now.
      </p>
    );
  }

  return (
    <ul className="mt-4 grid gap-3 sm:grid-cols-2">
      {sorted.map((row) => {
        const nm = memberLabels[row.userId] ?? row.userId.slice(0, 6);
        const n = row.netAmount;
        const dir =
          n > 0.005
            ? "should generally collect"
            : n < -0.005
              ? "owes toward the kitty"
              : "even-keeled";
        return (
          <li
            key={row.userId}
            className="rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/90 px-3 py-2.5"
          >
            <p className="text-sm font-semibold text-dm-text">{nm}</p>
            <p className="mt-1 font-mono text-lg tabular-nums text-dm-text">
              {fmtMoney(n)}
            </p>
            <p className="mt-1 text-[11px] text-dm-muted capitalize">{dir}</p>
          </li>
        );
      })}
    </ul>
  );
}
