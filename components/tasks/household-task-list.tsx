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
        <span className="tabular-nums">Saving</span>
      </span>
    );
  }
  return <>{idle}</>;
}

function TaskRowPulse() {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 rounded-2xl border-2 border-[color-mix(in_srgb,var(--dm-accent)_55%,transparent)] shadow-[0_0_42px_-6px_color-mix(in_srgb,var(--dm-accent)_45%,transparent)] dm-task-complete-pulse"
    />
  );
}

export function HouseholdTaskList({
  tasks,
}: {
  tasks: HouseholdTaskRow[];
}) {
  if (!tasks.length) {
    return (
      <div className="dm-card-surface dm-fade-in-up rounded-[1.35rem] border-dashed border-[color-mix(in_srgb,var(--dm-electric)_22%,transparent)] px-5 py-9 text-center">
        <p className="text-sm font-semibold leading-relaxed text-dm-text">
          All clear. Nobody&apos;s slacking today — at least on chores 👀
        </p>
        <p className="mt-3 text-[13px] leading-relaxed text-dm-muted">
          Drop one spicy chore on the right and watch the gang claim glory (and
          your fake internet points).
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-2.5">
      {tasks.map((t, i) => (
        <li key={t.id}>
          <form
            action={completeHouseholdTaskForm}
            className="relative block overflow-visible rounded-2xl"
          >
            <input type="hidden" name="task_id" value={t.id} />
            <input type="hidden" name="household_id" value={t.householdId} />
            <div
              className={[
                "dm-card-surface dm-card-interactive dm-fade-in-up relative z-[1] flex flex-wrap items-start justify-between gap-4 p-4 md:p-[1.1rem]",
              ].join(" ")}
              style={{ animationDelay: `${Math.min(i, 12) * 45}ms` }}
            >
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="inline-flex rounded-lg bg-[color-mix(in_srgb,var(--dm-fun)_20%,transparent)] px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-dm-text ring-1 ring-[color-mix(in_srgb,var(--dm-fun)_35%,transparent)]">
                    +{t.rewardPoints} pts
                  </div>
                  <h4 className="text-[15px] font-bold text-dm-text">{t.title}</h4>
                </div>
                {t.notes ? (
                  <p className="mt-2 text-sm leading-relaxed text-dm-muted">{t.notes}</p>
                ) : null}
                {t.rewardLabel ? (
                  <p className="mt-2 text-xs font-bold italic text-dm-accent">
                    {t.rewardLabel}
                  </p>
                ) : null}
              </div>
              <button
                type="submit"
                className="dm-hover-tap relative z-[2] rounded-xl bg-gradient-to-br from-dm-accent to-[color-mix(in_srgb,var(--dm-accent)_65%,var(--dm-electric))] px-5 py-2 text-[11px] font-black uppercase tracking-wide text-[var(--dm-accent-ink)] shadow-[0_12px_32px_-12px_color-mix(in_srgb,var(--dm-accent)_55%,transparent)] transition-[filter] duration-200 hover:brightness-110"
              >
                <CompleteChip idle="Claim win" />
              </button>
            </div>
            <TaskRowPulse />
          </form>
        </li>
      ))}
    </ul>
  );
}
