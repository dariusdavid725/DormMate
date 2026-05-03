"use client";

import { useFormStatus } from "react-dom";

import { completeHouseholdTaskForm } from "@/lib/tasks/actions";
import type { HouseholdTaskRow } from "@/lib/tasks/queries";

function CompleteChip({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  if (pending) return <>…</>;
  return <>{idle}</>;
}

export function HouseholdTaskList({
  tasks,
}: {
  tasks: HouseholdTaskRow[];
}) {
  if (!tasks.length) {
    return (
      <div className="cozy-note cozy-tilt-xs px-4 py-6 text-center text-[13px] text-dm-muted shadow-[var(--cozy-shadow-note)]">
        Corkboard&apos;s empty — jot the next chore and someone will nab it.
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((t, i) => (
        <li key={t.id}>
          <form
            action={completeHouseholdTaskForm}
            className={[
              "relative cozy-note cozy-hover-wiggle cozy-drop-in px-4 pb-4 pt-7 shadow-[var(--cozy-shadow-note)]",
              i % 2 === 0 ? "cozy-tilt-xs" : "cozy-tilt-xs-alt",
            ].join(" ")}
            style={{ animationDelay: `${Math.min(i, 8) * 55}ms` }}
          >
            <span
              className="cozy-pin absolute left-1/2 top-2 -translate-x-1/2"
              aria-hidden
            />
            <input type="hidden" name="task_id" value={t.id} />
            <input type="hidden" name="household_id" value={t.householdId} />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-[11px] font-bold uppercase tracking-wide text-dm-muted">
                  +{t.rewardPoints} pts
                </p>
                <p className="mt-1 text-[15px] font-semibold text-dm-text">{t.title}</p>
                {t.notes ? (
                  <p className="mt-2 text-[13px] leading-snug text-dm-muted">{t.notes}</p>
                ) : null}
                {t.rewardLabel ? (
                  <p className="mt-2 text-xs italic text-[var(--dm-electric-deep)]">
                    {t.rewardLabel}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                className="cozy-complete shrink-0 rounded-md border border-[rgba(54,47,40,0.12)] bg-dm-electric px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-[1px_2px_0_rgba(54,47,40,0.08)] hover:brightness-105"
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
