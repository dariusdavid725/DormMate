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
}: {
  items: HouseActivityItem[];
  showSeeMore?: boolean;
  className?: string;
}) {
  const [filter, setFilter] = useState<ActivityFilter>("all");
  const filtered = useMemo(() => items.filter((item) => matchesFilter(item, filter)), [items, filter]);
  const previewItems = showSeeMore ? filtered.slice(0, 4) : filtered;

  return (
    <section className={`dm-module p-5 ${className}`}>
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <h2 className="dm-section-heading">Home activity</h2>
        <div className="flex flex-wrap items-center gap-1.5">
          {FILTERS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={[
                "rounded-full px-2.5 py-1 text-[11px] font-semibold transition-all duration-200",
                filter === tab.id
                  ? "bg-[color-mix(in_srgb,var(--dm-electric)_14%,#fff)] text-[var(--dm-electric-deep)] ring-1 ring-[var(--dm-electric-border)]"
                  : "bg-dm-surface-mid/45 text-dm-muted hover:bg-dm-surface-mid/70 hover:text-dm-text",
              ].join(" ")}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <HouseActivityFeed items={previewItems} />

      {showSeeMore ? (
        <div className="mt-3 flex justify-end">
          <Link href="/dashboard/activity" className="text-[12px] font-semibold text-dm-electric hover:underline">
            See more activity
          </Link>
        </div>
      ) : null}
    </section>
  );
}
