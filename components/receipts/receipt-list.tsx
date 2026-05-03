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
      <div className="cozy-note cozy-tilt-xs px-4 py-10 text-center text-[13px] text-dm-muted shadow-[var(--cozy-shadow-note)]">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="cozy-receipt cozy-tilt-xs overflow-hidden">
      <ul className="divide-y divide-dashed divide-[rgba(91,79,71,0.18)] px-4 py-3">
        {receipts.map((r) => (
          <li
            key={r.id}
            className="cozy-hover-wiggle flex flex-wrap items-start justify-between gap-3 py-3 first:pt-0"
          >
            <div className="min-w-0">
              <p className="truncate font-semibold text-dm-text">
                {r.merchant ?? "Unknown"}
              </p>
              <p className="mt-1 text-[11px] text-dm-muted tabular-nums">
                Added {fmtWhen(r.created_at)}
                {r.source_filename ? ` · ${r.source_filename}` : ""}
              </p>
            </div>
            <div className="text-right">
              <p className="font-mono text-sm font-semibold tabular-nums text-dm-text">
                {fmtMoney(r.total_amount, r.currency)}
              </p>
              {r.purchased_at ? (
                <p className="mt-1 text-[10px] text-dm-muted">
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
    </div>
  );
}
