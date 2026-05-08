import type { HouseholdTaskRow } from "@/lib/tasks/queries";

import { HouseholdCompletedTaskList, HouseholdTaskList } from "@/components/tasks/household-task-list";

type Props = {
  tasks: HouseholdTaskRow[];
  doneRecently: HouseholdTaskRow[];
  currentUserId: string;
  memberLabels: Record<string, string>;
};

/** Open chores first; completed tucked in a native-style collapsible — no segmented “mode” switch. */
export function MobileTasksContent({
  tasks,
  doneRecently,
  currentUserId,
  memberLabels,
}: Props) {
  return (
    <div className="space-y-4 lg:hidden">
      <HouseholdTaskList
        tasks={tasks}
        currentUserId={currentUserId}
        memberLabels={memberLabels}
      />

      {doneRecently.length > 0 ?
        <details className="group dm-press-soft overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--dm-success)_22%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-success)_6%,white)] shadow-[0_10px_24px_rgba(28,39,56,0.06)] motion-reduce:transition-none [&_summary::-webkit-details-marker]:hidden">
          <summary className="touch-manipulation flex min-h-[48px] list-none cursor-pointer items-center justify-between gap-3 px-4 py-3 text-left transition-[background-color] duration-200 hover:bg-white/55 motion-reduce:transition-none active:bg-white/70">
            <span className="text-[13px] font-bold text-dm-text">
              Recently done
              <span className="ml-2 inline-flex min-w-[1.75rem] items-center justify-center rounded-full border border-[var(--dm-border)] bg-white/85 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-dm-muted">
                {doneRecently.length}
              </span>
            </span>
            <span className="shrink-0 text-dm-muted transition-transform duration-200 group-open:-rotate-180 motion-reduce:transition-none" aria-hidden>
              ⌄
            </span>
          </summary>
          <div className="border-t border-[var(--dm-border-strong)] px-3 pb-3 pt-2">
            <HouseholdCompletedTaskList tasks={doneRecently} memberLabels={memberLabels} />
          </div>
        </details>
      : null}
    </div>
  );
}
