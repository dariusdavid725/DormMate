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

const DEMO_FEED = [
  {
    icon: "🧹",
    title: "Rota teaser",
    subtitle: "Shared chore board syncs soon — kitchens stay civil.",
    key: "demo-chore",
  },
  {
    icon: "👤",
    title: "Settle-ups",
    subtitle: "Venmo-equivalent settles land with Pro billing.",
    key: "demo-pay",
  },
] as const;

export function DashboardFeed({
  receipts,
}: {
  receipts: ReceiptFeedPreviewItem[];
}) {
  return (
    <div className="space-y-0">
      {receipts.map((r) => (
        <article
          key={r.id}
          className="border-b-[3px] border-dm-border-strong py-5 first:pt-0 last:border-b-0"
        >
          <div className="flex gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-[3px] border-dm-electric bg-dm-elevated text-lg shadow-[3px_3px_0_0_var(--dm-border-strong)]"
              aria-hidden
            >
              🤖
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
                {formatWhen(r.createdAt)} · {r.householdName}
              </p>
              <p className="mt-1 text-sm font-bold text-dm-text">
                AI · Receipt from {r.merchant?.trim() || "merchant"}
              </p>
              <p className="mt-2 font-mono text-sm tabular-nums text-dm-electric">
                Total tracked {formatMoney(r.totalAmount, r.currency)}
              </p>
              <Link
                href={`/dashboard/household/${r.householdId}?view=receipts`}
                className="mt-3 inline-flex text-xs font-black uppercase tracking-wide text-dm-accent hover:underline"
              >
                Open receipts →
              </Link>
            </div>
          </div>
        </article>
      ))}

      {DEMO_FEED.map((d, i) => (
        <article
          key={d.key}
          className="border-b-[3px] border-dm-border-strong py-5 last:border-b-0 opacity-90"
          style={{ animationDelay: `${i * 80}ms` }}
        >
          <div className="flex gap-4">
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md border-[3px] border-dm-muted/40 bg-dm-bg text-lg"
              aria-hidden
            >
              {d.icon}
            </span>
            <div className="min-w-0">
              <p className="font-mono text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
                Preview
              </p>
              <p className="mt-1 text-sm font-semibold text-dm-text">{d.title}</p>
              <p className="mt-1 text-[13px] leading-relaxed text-dm-muted">
                {d.subtitle}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
