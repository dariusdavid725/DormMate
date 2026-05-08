"use client";

import { useState } from "react";

import type { HouseholdTaskRow } from "@/lib/tasks/queries";

import { HouseholdCompletedTaskList, HouseholdTaskList } from "@/components/tasks/household-task-list";

type Props = {
  tasks: HouseholdTaskRow[];
  doneRecently: HouseholdTaskRow[];
  currentUserId: string;
  memberLabels: Record<string, string>;
};

export function MobileTasksContent({
  tasks,
  doneRecently,
  currentUserId,
  memberLabels,
}: Props) {
  const [filter, setFilter] = useState<"open" | "done">("open");

  const displayOpen = filter === "open" ? tasks : [];

  return (
    <div className="space-y-5 lg:hidden">
      <div className="flex gap-2 rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface-mid/40 p-1">
        <button
          type="button"
          onClick={() => setFilter("open")}
          className={`touch-manipulation min-h-[44px] flex-1 rounded-lg px-3 text-[14px] font-semibold transition-colors ${
            filter === "open" ?
              "bg-dm-surface text-dm-text shadow-sm"
            : "text-dm-muted hover:text-dm-text"
          }`}
        >
          Open
        </button>
        <button
          type="button"
          onClick={() => setFilter("done")}
          className={`touch-manipulation min-h-[44px] flex-1 rounded-lg px-3 text-[14px] font-semibold transition-colors ${
            filter === "done" ?
              "bg-dm-surface text-dm-text shadow-sm"
            : "text-dm-muted hover:text-dm-text"
          }`}
        >
          Done
        </button>
      </div>

      {filter === "open" ?
        <HouseholdTaskList
          tasks={displayOpen}
          currentUserId={currentUserId}
          memberLabels={memberLabels}
        />
      : (
        <div className="rounded-2xl border border-[var(--dm-border)] bg-dm-surface/95 px-4 py-4 shadow-[var(--cozy-shadow-note)]">
          <h3 className="text-[15px] font-semibold text-dm-text">Recently finished</h3>
          <HouseholdCompletedTaskList tasks={doneRecently} memberLabels={memberLabels} />
        </div>
      )}
    </div>
  );
}
