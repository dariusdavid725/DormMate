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
    title: "Chores without the drama thread",
    subtitle: "Rotations tied to chores — onboarding soon.",
    key: "demo-chore",
  },
  {
    icon: "↔️",
    title: "Quiet settle-ups",
    subtitle: "When split math launches, confirmations glow mint.",
    key: "demo-pay",
  },
] as const;

export function DashboardFeed({
  receipts,
}: {
  receipts: ReceiptFeedPreviewItem[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/58 backdrop-blur-sm">
      {receipts.map((r) => (
        <article
          key={r.id}
          className="border-b border-[var(--dm-border)] px-5 py-5 last:border-b-0 sm:px-6"
        >
          <div className="flex gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[var(--dm-accent-soft)] text-lg shadow-inner shadow-black/[0.04]"
              aria-hidden
            >
              🤖
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-dm-muted">
                <span className="font-semibold tracking-tight text-dm-text">
                  AI
                </span>{" "}
                · {formatWhen(r.createdAt)} ·{" "}
                <span className="text-dm-text/85">{r.householdName}</span>
              </p>
              <p className="mt-1.5 text-[15px] font-semibold leading-snug text-dm-text">
                Receipt · {r.merchant?.trim() || "merchant"}
              </p>
              <p className="mt-2 font-mono text-sm tabular-nums text-dm-electric">
                {formatMoney(r.totalAmount, r.currency)}
              </p>
              <Link
                href={`/dashboard/household/${r.householdId}?view=receipts`}
                className="mt-3 inline-flex text-sm font-semibold text-dm-electric hover:underline"
              >
                View receipts
              </Link>
            </div>
          </div>
        </article>
      ))}

      {DEMO_FEED.map((d, i) => (
        <article
          key={d.key}
          className={`border-b border-[var(--dm-border)] px-5 py-5 last:border-b-0 sm:px-6 ${receipts.length === 0 && i === 0 ? "" : "opacity-[0.93]"}`}
        >
          <div className="flex gap-4">
            <div
              className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-dm-bg text-lg ring-1 ring-[var(--dm-border)]"
              aria-hidden
            >
              {d.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[12px] font-medium text-dm-muted">
                Coming next
              </p>
              <p className="mt-1.5 font-semibold text-dm-text">{d.title}</p>
              <p className="mt-1 text-[14px] leading-relaxed text-dm-muted">
                {d.subtitle}
              </p>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
