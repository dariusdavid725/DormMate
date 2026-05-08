import Link from "next/link";

import type { HouseActivityItem } from "@/lib/dashboard/house-activity";
import { formatRelativeTime } from "@/lib/format-relative";

export function HouseActivityFeed({
  items,
}: {
  items: HouseActivityItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="cozy-note cozy-tilt-xs px-4 py-6 text-center text-[13px] text-dm-muted">
        Quiet hallway — notes will land here soon.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {items.map((item, i) => {
        if (item.kind === "generic_note") {
          const kindLabel =
            item.href?.includes("view=tasks") ? "Chores"
            : item.href?.includes("view=expenses") ? "Money"
            : item.href?.includes("view=events") ? "Events"
            : item.href?.includes("/dashboard/inventory") ? "Groceries"
            : "Update";
          return (
            <li
              key={`g-${item.id}`}
              className="dm-card-enter dm-hover-lift rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/35 px-3 py-2.5"
              style={{ animationDelay: `${Math.min(i, 8) * 36}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-semibold uppercase tracking-wide text-dm-muted">{item.label}</p>
                  <p className="mt-0.5 line-clamp-2 text-[13px] text-dm-text">{item.body}</p>
                  <p className="mt-1 text-[11px] text-dm-muted">
                    {item.householdName} · {formatRelativeTime(item.at)}
                  </p>
                </div>
                <span className="dm-chip shrink-0">{kindLabel}</span>
              </div>
              {item.href ?
                  <Link
                    href={item.href}
                    className="dm-focus-ring dm-interactive mt-1.5 inline-flex rounded-sm px-1 py-0.5 text-[11px] font-semibold text-dm-electric hover:underline"
                  >
                    Peek
                  </Link>
              : null}
            </li>
          );
        }

        if (item.kind === "receipt_saved") {
          return (
            <li
              key={`r-${item.id}`}
              className="dm-card-enter dm-hover-lift rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/35 px-3 py-2.5"
              style={{ animationDelay: `${Math.min(i, 8) * 36}ms` }}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-[12px] font-medium uppercase tracking-wider text-dm-muted">Receipt</p>
                  <p className="mt-0.5 text-[13px] text-dm-text">
                    <span className="font-semibold">{item.savedByLabel}</span>
                    {" · "}
                    {item.merchant?.trim() || "shop"}{" "}
                    <span className="font-mono tabular-nums">{item.amountLabel}</span>
                  </p>
                  <p className="mt-1 text-[11px] text-dm-muted">
                    {item.householdName} · {formatRelativeTime(item.at)}
                  </p>
                </div>
                <span className="dm-chip shrink-0">Receipts</span>
              </div>
              <p className="mt-1">
                <Link
                  href={`/dashboard/household/${item.householdId}?view=receipts`}
                  className="dm-focus-ring dm-interactive rounded-sm px-1 py-0.5 text-[11px] font-semibold text-dm-electric hover:underline"
                >
                  Open
                </Link>
              </p>
            </li>
          );
        }

        return (
          <li
            key={`t-${item.id}`}
            className="dm-card-enter dm-hover-lift rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/35 px-3 py-2.5"
            style={{ animationDelay: `${Math.min(i, 8) * 36}ms` }}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <p className="text-[12px] font-semibold uppercase tracking-wide text-dm-muted">Chore done</p>
                <p className="mt-0.5 text-[13px] text-dm-text">
                  <span className="font-semibold">{item.completedByLabel}</span>
                  {": "}
                  {item.title}
                </p>
                <p className="mt-1 text-[11px] text-dm-muted">
                  +{item.points} pts · {item.householdName} · {formatRelativeTime(item.at)}
                </p>
              </div>
              <span className="dm-chip shrink-0">Chores</span>
            </div>
            <Link
              href={`/dashboard/household/${item.householdId}?view=tasks`}
              className="dm-focus-ring dm-interactive mt-1.5 inline-block rounded-sm px-1 py-0.5 text-[11px] font-semibold text-dm-electric hover:underline"
            >
              Chores
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
