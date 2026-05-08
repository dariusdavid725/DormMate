"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { HouseActivityFeed } from "@/components/dashboard/house-activity-feed";
import type { HouseActivityItem } from "@/lib/dashboard/house-activity";

type ActivityFilter = "all" | "chores" | "money" | "receipts" | "groceries" | "events";

const FILTERS: Array<{ id: ActivityFilter; label: string }> = [
  { id: "all", label: "All" },
  { id: "chores", label: "Chores" },
  { id: "money", label: "Money" },
  { id: "receipts", label: "Receipts" },
  { id: "groceries", label: "Groceries" },
  { id: "events", label: "Events" },
];

function matchesFilter(item: HouseActivityItem, filter: ActivityFilter) {
  if (filter === "all") return true;
  if (filter === "receipts") return item.kind === "receipt_saved";
  if (filter === "chores") {
    return (
      item.kind === "chore_done" ||
      (item.kind === "generic_note" &&
        ((item.href?.includes("view=tasks") ?? false) || item.label.toLowerCase().includes("chore")))
    );
  }
  if (filter === "money") {
    return (
      item.kind === "generic_note" &&
      ((item.href?.includes("view=expenses") ?? false) || item.label.toLowerCase().includes("expense"))
    );
  }
  if (filter === "groceries") {
    return (
      item.kind === "generic_note" &&
      ((item.href?.includes("/dashboard/inventory") ?? false) || item.label.toLowerCase().includes("grocery"))
    );
  }
  if (filter === "events") {
    return (
      item.kind === "generic_note" &&
      ((item.href?.includes("view=events") ?? false) || item.label.toLowerCase().includes("calendar"))
    );
  }
  return false;
}

export function DashboardActivityPanel({
  items,
  showSeeMore = true,
  className = "",
  embedded = false,
  title = "Home activity",
}: {
  items: HouseActivityItem[];
  showSeeMore?: boolean;
  className?: string;
  /** Nested inside a richer parent surface (e.g. home board stage). */
  embedded?: boolean;
  title?: string;
}) {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const filtered = useMemo(() => items.filter((item) => matchesFilter(item, filter)), [items, filter]);
  const previewItems = showSeeMore ? filtered.slice(0, 4) : filtered;

  const shell = embedded
    ? `rounded-[14px] bg-transparent p-5 ${className}`
    : `dm-module dm-module-rich dm-page-enter p-5 ${className}`;

  return (
    <section className={shell}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="dm-section-heading">{title}</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
                    className={[
                      "dm-tab dm-focus-ring dm-interactive px-2.5 py-1 text-[11px] font-semibold",
                filter === tab.id
                        ? "ring-1 ring-[var(--dm-electric-border)]"
                        : "bg-dm-surface-mid/45 hover:bg-dm-surface-mid/70 hover:text-dm-text",
              ].join(" ")}
                    data-active={filter === tab.id ? "true" : "false"}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <HouseActivityFeed items={previewItems} />

      {showSeeMore ? (
        <div className="mt-3 flex justify-end">
          <Link href="/dashboard/activity" className="dm-focus-ring dm-interactive rounded-md px-1.5 py-0.5 text-[12px] font-semibold text-dm-electric hover:underline">
            See more activity
          </Link>
        </div>
      ) : null}
    </section>
  );
}
