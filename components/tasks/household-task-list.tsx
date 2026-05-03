"use client";

import { useFormStatus } from "react-dom";

import { completeHouseholdTaskForm } from "@/lib/tasks/actions";
import type { HouseholdTaskRow } from "@/lib/tasks/queries";

function CompleteChip({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  if (pending) {
    return (
      <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide">
        <span className="dm-flash-check text-sm leading-none" aria-hidden>
          ✓
        </span>
        <span className="tabular-nums">Saved</span>
      </span>
    );
  }
  return <>{idle}</>;
}

export function HouseholdTaskList({
  tasks,
}: {
  tasks: HouseholdTaskRow[];
}) {
  if (!tasks.length) {
    return (
      <div className="rounded-3xl border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/55 px-5 py-10 text-center backdrop-blur-sm">
        <p className="text-sm font-medium leading-relaxed text-dm-text">
          All clear. Nobody&apos;s slacking today — at least on chores 👀
        </p>
        <p className="mt-2 text-sm leading-relaxed text-dm-muted">
          Drop the next job above and the flat gets pinged without a lecture.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((t) => (
        <li key={t.id}>
          <div className="flex flex-wrap items-start justify-between gap-4 rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/72 p-4 shadow-md shadow-black/[0.04] backdrop-blur-sm md:p-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <div className="inline-flex rounded-md bg-[color-mix(in_srgb,var(--dm-fun)_22%,transparent)] px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-dm-text">
                  +{t.rewardPoints}
                </div>
                <h4 className="text-[15px] font-semibold text-dm-text">{t.title}</h4>
              </div>
              {t.notes ? (
                <p className="mt-2 text-sm leading-relaxed text-dm-muted">{t.notes}</p>
              ) : null}
              {t.rewardLabel ? (
                <p className="mt-2 text-xs font-semibold italic text-dm-accent">
                  {t.rewardLabel}
                </p>
              ) : null}
            </div>
            <form action={completeHouseholdTaskForm}>
              <input type="hidden" name="task_id" value={t.id} />
              <input type="hidden" name="household_id" value={t.householdId} />
              <button
                type="submit"
                className="dm-hover-tap rounded-full bg-[var(--dm-accent)] px-5 py-2 text-xs font-bold uppercase tracking-wide text-[var(--dm-accent-ink)] shadow-sm transition-[filter] duration-200 hover:brightness-105"
              >
                <CompleteChip idle="Claim" />
              </button>
            </form>
          </div>
        </li>
      ))}
    </ul>
  );
}
