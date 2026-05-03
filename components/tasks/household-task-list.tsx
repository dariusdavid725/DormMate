"use client";

import { useFormStatus } from "react-dom";

import { completeHouseholdTaskForm } from "@/lib/tasks/actions";
import type { HouseholdTaskRow } from "@/lib/tasks/queries";

function CompleteChip({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  if (pending) return <>{idle}…</>;
  return <>{idle}</>;
}

export function HouseholdTaskList({
  tasks,
}: {
  tasks: HouseholdTaskRow[];
}) {
  if (!tasks.length) {
    return (
      <div className="rounded-lg border border-dashed border-[var(--dm-border-strong)] bg-dm-surface px-4 py-6 text-[13px] text-dm-muted">
        No open tasks.
      </div>
    );
  }

  return (
    <ul className="space-y-2">
      {tasks.map((t) => (
        <li key={t.id}>
          <form
            action={completeHouseholdTaskForm}
            className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-3"
          >
            <input type="hidden" name="task_id" value={t.id} />
            <input type="hidden" name="household_id" value={t.householdId} />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-dm-text">
                  <span className="mr-2 font-mono text-xs tabular-nums text-dm-muted">
                    +{t.rewardPoints}
                  </span>
                  {t.title}
                </p>
                {t.notes ? (
                  <p className="mt-1 text-[13px] text-dm-muted">{t.notes}</p>
                ) : null}
                {t.rewardLabel ? (
                  <p className="mt-1 text-xs text-dm-muted">{t.rewardLabel}</p>
                ) : null}
              </div>
              <button
                type="submit"
                className="shrink-0 rounded-md bg-dm-electric px-4 py-1.5 text-xs font-medium text-[var(--dm-accent-ink)] hover:brightness-105"
              >
                <CompleteChip idle="Claim" />
              </button>
            </div>
          </form>
        </li>
      ))}
    </ul>
  );
}
