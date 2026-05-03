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
      <div className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface px-4 py-5 text-[13px] text-dm-muted">
        No recent activity.
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[var(--dm-border)] rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface">
      {items.map((item) => {
        if (item.kind === "receipt_saved") {
          return (
            <li key={`r-${item.id}`} className="space-y-1 px-4 py-2.5">
              <p className="text-[13px] text-dm-text">
                <span className="font-medium">{item.savedByLabel}</span>
                {" · "}receipt · {item.merchant?.trim() || "unknown"}{" "}
                <span className="font-mono tabular-nums text-dm-text">
                  {item.amountLabel}
                </span>
                <span className="text-dm-muted">
                  {" "}
                  ({item.householdName})
                </span>
              </p>
              <p className="flex items-center gap-3 text-[11px] text-dm-muted">
                <span>{formatRelativeTime(item.at)}</span>
                <Link
                  href={`/dashboard/household/${item.householdId}?view=receipts`}
                  className="font-medium text-dm-electric hover:underline"
                >
                  View
                </Link>
              </p>
            </li>
          );
        }

        return (
          <li key={`t-${item.id}`} className="space-y-1 px-4 py-2.5">
            <p className="text-[13px] text-dm-text">
              <span className="font-medium">{item.completedByLabel}</span>
              {" completed "}
              <span>{item.title}</span>
              <span className="text-dm-muted">
                {" "}
                · +{item.points} pts · {item.householdName}
              </span>
            </p>
            <p className="flex items-center gap-3 text-[11px] text-dm-muted">
              <span>{formatRelativeTime(item.at)}</span>
              <Link
                href={`/dashboard/household/${item.householdId}?view=tasks`}
                className="font-medium text-dm-electric hover:underline"
              >
                Open tasks
              </Link>
            </p>
          </li>
        );
      })}
    </ul>
  );
}
