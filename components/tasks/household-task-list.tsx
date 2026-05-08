"use client";

import { useFormStatus } from "react-dom";

import { completeHouseholdTaskForm } from "@/lib/tasks/actions";
import type { HouseholdTaskRow } from "@/lib/tasks/queries";

function CompleteChip({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  if (pending) return <>…</>;
  return <>{idle}</>;
}

function formatDue(iso: string | null) {
  if (!iso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return null;
  }
}

export function HouseholdTaskList({
  tasks,
  currentUserId,
  memberLabels,
}: {
  tasks: HouseholdTaskRow[];
  currentUserId: string;
  memberLabels: Record<string, string>;
}) {
  if (!tasks.length) {
    return (
      <div className="dm-empty-well shadow-[var(--cozy-shadow-note)]" role="status">
        <span className="dm-empty-well__glyph" aria-hidden>
          ✨
        </span>
        <p className="text-sm font-semibold text-dm-text">Nothing on the hook</p>
        <p className="mt-2 text-[13px] leading-relaxed text-dm-muted">
          All clear—no chores waiting. When something&apos;s shared, pin it here so it doesn&apos;t get lost in chat.
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3">
      {tasks.map((t, index) => {
        const blocked =
          t.assignedToUserId != null &&
          t.assignedToUserId !== currentUserId;
        const assigneeLabel = t.assignedToUserId
          ? memberLabels[t.assignedToUserId]?.trim() || "Mate"
          : null;
        const dueLabel = formatDue(t.dueAt);

        return (
          <li key={t.id}>
            <form
              action={completeHouseholdTaskForm}
              className={[
                "dm-hover-lift dm-interactive relative cozy-note cozy-drop-in px-4 pb-4 pt-7",
                blocked ? "opacity-[0.92]" : "",
              ].join(" ")}
              style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
            >
              <span
                className="cozy-pin absolute left-1/2 top-2 -translate-x-1/2"
                aria-hidden
              />
              <input type="hidden" name="task_id" value={t.id} />
              <input type="hidden" name="household_id" value={t.householdId} />
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="dm-chip text-[11px] font-bold uppercase tracking-wide text-dm-muted">
                    +{t.rewardPoints} pts
                  </p>
                  <p className="mt-1 text-[15px] font-semibold text-dm-text">{t.title}</p>
                  {t.notes ? (
                    <p className="mt-2 text-[13px] leading-snug text-dm-muted">{t.notes}</p>
                  ) : null}
                  {assigneeLabel ? (
                    <p className="mt-2 text-[12px] text-dm-muted">
                      For <span className="font-semibold text-dm-text">{assigneeLabel}</span>
                    </p>
                  ) : (
                    <p className="mt-2 text-[12px] text-dm-muted italic">
                      Anyone can claim this one
                    </p>
                  )}
                  {dueLabel ? (
                    <p className="mt-1 inline-flex rounded-full bg-[var(--dm-accent-warn-bg)] px-2 py-0.5 text-[11px] font-medium text-[var(--dm-accent-warn-text)]">
                      Due {dueLabel}
                    </p>
                  ) : null}
                  {t.rewardLabel ? (
                    <p className="mt-2 text-xs italic text-[var(--dm-electric-deep)]">
                      {t.rewardLabel}
                    </p>
                  ) : null}
                </div>
                {blocked ? (
                  <p className="shrink-0 rounded-md border border-dashed border-[var(--dm-border-strong)] px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
                    Assigned
                  </p>
                ) : (
                  <button
                    type="submit"
                    className="cozy-complete dm-btn-task-claim dm-focus-ring shrink-0 rounded-md border border-[rgba(54,47,40,0.12)] bg-dm-electric px-4 py-2.5 text-xs font-semibold uppercase tracking-wide text-white shadow-[1px_2px_0_rgba(54,47,40,0.08)] min-h-[44px] hover:brightness-105 sm:min-h-0 sm:py-2 touch-manipulation"
                  >
                    <CompleteChip idle="Claim" />
                  </button>
                )}
              </div>
            </form>
          </li>
        );
      })}
    </ul>
  );
}

export function HouseholdCompletedTaskList({
  tasks,
  memberLabels,
}: {
  tasks: HouseholdTaskRow[];
  memberLabels: Record<string, string>;
}) {
  if (!tasks.length) return null;

  return (
    <ul className="mt-4 space-y-2">
      {tasks.map((t) => {
        const who = t.completedByUserId
          ? memberLabels[t.completedByUserId]?.trim() || "Someone"
          : "Someone";
        return (
          <li
            key={t.id}
            className="rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/85 px-3 py-2.5 text-[13px] text-dm-muted"
          >
            <span className="font-medium text-dm-text">{t.title}</span>
            {" · "}
            done by <span className="text-dm-text">{who}</span>
            {t.completedAt ? (
              <>
                {" · "}
                <span className="text-[12px]">
                  {formatDue(t.completedAt)}
                </span>
              </>
            ) : null}
          </li>
        );
      })}
    </ul>
  );
}
