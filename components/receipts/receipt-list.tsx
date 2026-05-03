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
      <div className="dm-fade-in-up dm-card-surface rounded-[1.25rem] border-dashed border-[color-mix(in_srgb,var(--dm-electric)_28%,transparent)] px-7 py-12 text-center">
        <p className="text-sm font-semibold leading-relaxed text-dm-text">{emptyHint}</p>
        <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-dm-muted">
          Future split math thrives on crumbs of truth — snag a blurry pic anyway, we flirt with pixels for you ✨
        </p>
      </div>
    );
  }

  return (
    <ul className="dm-card-surface dm-fade-in-up divide-y divide-[var(--dm-border)] overflow-hidden rounded-[1.25rem]">
      {receipts.map((r, i) => (
        <li
          key={r.id}
          className="dm-hover-tap dm-fade-in-up flex flex-wrap items-start justify-between gap-4 px-5 py-4 transition-[background-color] duration-150 hover:bg-[color-mix(in_srgb,var(--dm-surface-mid)_76%,transparent)]"
          style={{ animationDelay: `${Math.min(i, 8) * 36}ms` }}
        >
          <div className="min-w-0">
            <p className="truncate font-bold text-dm-text">{r.merchant ?? "Unknown shop"}</p>
            <p className="mt-1 text-xs font-medium text-dm-muted">
              Added {fmtWhen(r.created_at)}
              {r.source_filename ? ` · ${r.source_filename}` : ""}
            </p>
          </div>
          <div className="text-right">
            <p className="font-mono text-base font-black tabular-nums text-dm-accent">
              {fmtMoney(r.total_amount, r.currency)}
            </p>
            {r.purchased_at ? (
              <p className="mt-1 text-[11px] text-dm-muted">
                Receipt ·{" "}
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
