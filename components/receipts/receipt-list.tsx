import type { ReceiptRow } from "@/lib/receipts/types";

function fmtMoney(amount: number | null, currency: string) {
  if (amount == null) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency.length === 3 ? currency : "EUR",
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function fmtWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ReceiptList({
  receipts,
  emptyHint,
}: {
  receipts: ReceiptRow[];
  emptyHint: string;
}) {
  if (receipts.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--dm-border-strong)] bg-dm-surface px-4 py-8 text-center text-[13px] text-dm-muted">
        {emptyHint}
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--dm-border)] overflow-hidden rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface">
      {receipts.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-start justify-between gap-4 px-4 py-3"
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-dm-text">
              {r.merchant ?? "Unknown"}
            </p>
            <p className="mt-0.5 text-xs text-dm-muted">
              {fmtWhen(r.created_at)}
              {r.source_filename ? ` · ${r.source_filename}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-sm font-medium tabular-nums text-dm-text">
              {fmtMoney(r.total_amount, r.currency)}
            </p>
            {r.purchased_at ? (
              <p className="mt-0.5 text-[11px] text-dm-muted">
                Purchase ·{" "}
                {new Intl.DateTimeFormat(undefined, {
                  dateStyle: "medium",
                }).format(new Date(r.purchased_at))}
              </p>
            ) : null}
          </div>
        </li>
      ))}
    </ul>
  );
}
