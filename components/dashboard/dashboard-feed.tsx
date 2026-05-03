import Link from "next/link";

import type { ReceiptFeedPreviewItem } from "@/lib/receipts/feed-queries";

function formatMoney(amount: number | null, currency: string) {
  if (amount === null || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount.toFixed(2)} ${currency}`;
  }
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function DashboardFeed({
  receipts,
}: {
  receipts: ReceiptFeedPreviewItem[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/72 backdrop-blur-sm">
      {receipts.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm leading-relaxed text-dm-muted">
          Quiet here — scans and chores will stack up soon. Nudge flatmates if you
          split something big.
        </p>
      ) : null}

      {receipts.map((r) => (
        <article
          key={r.id}
          className="border-t border-[var(--dm-border)] first:border-t-0 px-5 py-4 sm:px-6"
        >
          <div className="flex gap-3 sm:gap-4">
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--dm-accent-soft)] text-[15px]"
              aria-hidden
            >
              🧾
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[13px] leading-snug text-dm-text">
                <span className="font-semibold">{r.savedByLabel}</span>{" "}
                <span className="font-normal text-dm-muted">
                  logged a receipt · {r.householdName}
                </span>
              </p>
              <p className="mt-1 text-[13px] text-dm-muted">
                <span>{r.merchant?.trim() || "Retail"}</span>
                {" · "}
                <span className="font-mono font-semibold tabular-nums text-dm-accent">
                  {formatMoney(r.totalAmount, r.currency)}
                </span>
              </p>
              <p className="mt-2 text-[11px] text-dm-muted">
                {formatWhen(r.createdAt)}
              </p>
              <Link
                href={`/dashboard/household/${r.householdId}?view=receipts`}
                className="mt-2 inline-flex text-xs font-semibold text-dm-electric hover:underline"
              >
                Open receipt stash
              </Link>
            </div>
          </div>
        </article>
      ))}

      <article className="border-t border-[var(--dm-border-strong)] px-5 py-4 sm:px-6">
        <div className="flex gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--dm-fun)_55%,var(--dm-border))] bg-[color-mix(in_srgb,var(--dm-fun)_12%,var(--dm-surface))] text-[15px]"
            aria-hidden
          >
            ✨
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
              Soon
            </p>
            <p className="mt-1 text-[13px] font-medium leading-snug text-dm-text">
              Shared pizza votes & split bills — without the 40-message group chat.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
