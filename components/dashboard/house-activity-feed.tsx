import Link from "next/link";

import type { HouseActivityItem } from "@/lib/dashboard/house-activity";
import { formatRelativeTime } from "@/lib/format-relative";

export function HouseActivityFeed({ items }: { items: HouseActivityItem[] }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dm-surface)_92%,transparent),color-mix(in_srgb,var(--dm-bg)_40%,transparent))] backdrop-blur-sm">
      {items.length === 0 ? (
        <div className="dm-fade-in-up px-6 py-9 text-center">
          <p className="text-sm font-medium leading-relaxed text-dm-text">
            No expenses logged yet — perfect balance, or someone owes the group a
            pic of the receipt 😉
          </p>
          <p className="mt-3 text-[13px] leading-relaxed text-dm-muted">
            First Lidl run that hits the scanner pops in here. Chore wins show up
            the same way.
          </p>
        </div>
      ) : null}

      {items.map((item, i) => {
        const delay = Math.min(i, 10) * 42;
        if (item.kind === "receipt_saved") {
          return (
            <article
              key={`r-${item.id}`}
              className="dm-fade-in-up border-t border-[var(--dm-border)] first:border-t-0 px-5 py-4 sm:px-6"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="flex gap-3 sm:gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dm-accent-soft)] text-[15px]"
                  aria-hidden
                >
                  🧾
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-dm-text">
                    <span className="font-semibold">{item.savedByLabel}</span>{" "}
                    <span className="font-normal text-dm-muted">
                      added {item.merchant?.trim() || "a receipt"}
                    </span>{" "}
                    <span className="font-mono font-semibold tabular-nums text-dm-accent">
                      {item.amountLabel}
                    </span>
                    <span className="font-normal text-dm-muted">
                      {" "}
                      · {item.householdName}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[11px] text-dm-muted">
                    {formatRelativeTime(item.at)}
                  </p>
                  <Link
                    href={`/dashboard/household/${item.householdId}?view=receipts`}
                    className="dm-hover-tap mt-2 inline-flex text-xs font-semibold text-dm-electric hover:underline"
                  >
                    View receipts
                  </Link>
                </div>
              </div>
            </article>
          );
        }

        return (
          <article
            key={`t-${item.id}`}
            className="dm-fade-in-up border-t border-[var(--dm-border)] first:border-t-0 px-5 py-4 sm:px-6"
            style={{ animationDelay: `${delay}ms` }}
          >
            <div className="flex gap-3 sm:gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dm-accent)_16%,transparent)] text-[15px]"
                aria-hidden
              >
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-dm-text">
                  <span className="font-semibold">{item.completedByLabel}</span>{" "}
                  <span className="font-normal text-dm-muted">finished</span>{" "}
                  <span className="font-semibold text-dm-text">
                    “{item.title}”
                  </span>
                </p>
                <p className="mt-1 text-[13px] text-dm-accent">
                  +{item.points} pts · {item.householdName}
                </p>
                <p className="mt-1.5 text-[11px] text-dm-muted">
                  {formatRelativeTime(item.at)}
                </p>
                <Link
                  href={`/dashboard/household/${item.householdId}?view=tasks`}
                  className="dm-hover-tap mt-2 inline-flex text-xs font-semibold text-dm-electric hover:underline"
                >
                  Tasks
                </Link>
              </div>
            </div>
          </article>
        );
      })}

      <article className="border-t border-[var(--dm-border-strong)] px-5 py-4 sm:px-6">
        <div className="flex gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-[color-mix(in_srgb,var(--dm-fun)_45%,var(--dm-border))] bg-[color-mix(in_srgb,var(--dm-fun)_10%,var(--dm-surface))] text-[15px]"
            aria-hidden
          >
            ✨
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
              Next up
            </p>
            <p className="mt-1 text-[13px] font-medium leading-snug text-dm-text">
              “You owe Alex €6” lines are coming when split math ships — no more
              mental tabs on who paid last.
            </p>
            <p className="mt-2 text-[12px] leading-snug text-dm-muted">
              Room votes & shout-outs → same vibe, tracked so nobody gets lost in
              the chat.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
