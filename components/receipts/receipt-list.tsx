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
      <p className="dm-fade-in-up rounded-2xl border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/55 px-6 py-10 text-center text-sm leading-relaxed text-dm-muted">
        {emptyHint}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-[var(--dm-border)] overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/72 shadow-sm backdrop-blur-sm">
      {receipts.map((r, i) => (
        <li
          key={r.id}
          className="dm-fade-in-up flex flex-wrap items-start justify-between gap-4 px-5 py-4"
          style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-dm-text">
              {r.merchant ?? "Unknown shop"}
            </p>
            <p className="mt-1 text-xs text-dm-muted">
              Added {fmtWhen(r.created_at)}
              {r.source_filename ? ` · ${r.source_filename}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold tabular-nums text-dm-accent">
              {fmtMoney(r.total_amount, r.currency)}
            </p>
            {r.purchased_at ? (
              <p className="text-[11px] text-dm-muted">
                Receipt date ·{" "}
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
