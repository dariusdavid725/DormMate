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
      <p className="rounded-2xl border border-dashed border-stone-300 bg-stone-50/80 px-6 py-10 text-center text-sm text-stone-600 dark:border-stone-700 dark:bg-stone-900/40 dark:text-stone-400">
        {emptyHint}
      </p>
    );
  }

  return (
    <ul className="divide-y divide-stone-200 rounded-2xl border border-stone-200 bg-white shadow-sm dark:divide-stone-800 dark:border-stone-800 dark:bg-stone-950/60">
      {receipts.map((r) => (
        <li
          key={r.id}
          className="flex flex-wrap items-start justify-between gap-4 px-5 py-4"
        >
          <div className="min-w-0">
            <p className="truncate font-medium text-stone-900 dark:text-stone-50">
              {r.merchant ?? "Unknown shop"}
            </p>
            <p className="mt-1 text-xs text-stone-500 dark:text-stone-400">
              Added {fmtWhen(r.created_at)}
              {r.source_filename ? ` · ${r.source_filename}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="font-semibold tabular-nums text-stone-900 dark:text-stone-100">
              {fmtMoney(r.total_amount, r.currency)}
            </p>
            {r.purchased_at ? (
              <p className="text-[11px] text-stone-500 dark:text-stone-400">
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
