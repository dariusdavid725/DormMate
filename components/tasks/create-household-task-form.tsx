"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createHouseholdTask,
  type TaskActionState,
} from "@/lib/tasks/actions";

function SubmitPending({
  idle,
  className,
}: {
  idle: string;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return <span className={className}>{pending ? "Posting…" : idle}</span>;
}

type HouseholdOption = { id: string; name: string };

type MemberOption = { userId: string; label: string };

export function CreateHouseholdTaskForm({
  households,
  fixedHouseholdId,
  memberOptions,
  className,
}: {
  households: HouseholdOption[];
  fixedHouseholdId?: string;
  /** When provided (e.g. on household tasks tab), populate assign-to dropdown */
  memberOptions?: MemberOption[];
  className?: string;
}) {
  const [state, formAction] = useActionState<
    TaskActionState | null,
    FormData
  >(async (prev, formData) => {
    const next = await createHouseholdTask(prev ?? undefined, formData);
    return next ?? null;
  }, null);

  const fixed =
    typeof fixedHouseholdId === "string" ? fixedHouseholdId.trim() : "";
  const canPost = fixed.length > 0 || households.length > 0;

  const membersSorted = [...(memberOptions ?? [])].sort((a, b) =>
    a.label.localeCompare(b.label),
  );

  if (!canPost) {
    return null;
  }

  return (
    <form action={formAction} className={className}>
      {fixed.length ? (
        <input type="hidden" name="household_id" value={fixed} />
      ) : households.length > 1 ? (
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-dm-muted">
            Space
          </span>
          <select
            name="household_id"
            required
            className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface px-3 py-2.5 text-sm text-dm-text outline-none focus-visible:ring-2 focus-visible:ring-dm-electric/35"
            defaultValue={households[0]?.id}
          >
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input
          type="hidden"
          name="household_id"
          value={households[0]?.id ?? ""}
        />
      )}

      {state?.error ? (
        <p
          role="alert"
          className="mt-4 rounded-lg border border-dm-danger/35 bg-red-500/[0.07] px-3 py-2 text-sm font-medium text-dm-danger"
        >
          {state.error}
        </p>
      ) : null}

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-dm-muted">
          What needs doing?
        </span>
        <input
          type="text"
          name="title"
          required
          maxLength={140}
          placeholder="e.g. Take recycling down, mop kitchen…"
          className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/60 px-3 py-2.5 text-sm text-dm-text outline-none focus-visible:border-dm-electric focus-visible:ring-2 focus-visible:ring-dm-electric/20"
        />
      </label>

      <label className="mt-4 block">
        <span className="text-xs font-bold uppercase tracking-wider text-dm-muted">
          Notes · optional
        </span>
        <textarea
          name="notes"
          rows={2}
          maxLength={240}
          className="mt-2 w-full resize-none rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/60 px-3 py-2.5 text-sm text-dm-text outline-none focus-visible:border-dm-electric focus-visible:ring-2 focus-visible:ring-dm-electric/20"
        />
      </label>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-dm-muted">
            Assign to · optional
          </span>
          <select
            name="assigned_to"
            defaultValue=""
            className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/60 px-3 py-2.5 text-sm text-dm-text outline-none focus-visible:border-dm-electric"
          >
            <option value="">Anyone in the flat</option>
            {membersSorted.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.label}
              </option>
            ))}
          </select>
          {membersSorted.length === 0 ? (
            <span className="mt-2 block text-[11px] text-dm-muted">
              Invite roommates — then you can assign by name here.
            </span>
          ) : null}
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-dm-muted">
            Due · optional
          </span>
          <input
            type="date"
            name="due_at"
            className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/60 px-3 py-2.5 text-sm tabular-nums text-dm-text outline-none focus-visible:border-dm-electric"
          />
        </label>
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-dm-muted">
            Reward points
          </span>
          <input
            type="number"
            name="reward_points"
            min={1}
            max={500}
            defaultValue={10}
            className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/60 px-3 py-2.5 text-sm tabular-nums text-dm-text outline-none focus-visible:border-dm-electric"
          />
        </label>
        <label className="block">
          <span className="text-xs font-bold uppercase tracking-wider text-dm-muted">
            Flavour text · optional
          </span>
          <input
            type="text"
            name="reward_label"
            maxLength={60}
            placeholder="e.g. Choose next takeaway night"
            className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/60 px-3 py-2.5 text-sm text-dm-text outline-none focus-visible:border-dm-electric"
          />
        </label>
      </div>

      <button
        type="submit"
        className="dm-scan-hero dm-hover-tap mt-6 w-full rounded-md px-6 py-3 text-sm font-semibold text-[#fffaf5] shadow-[var(--cozy-shadow-paper)] transition hover:brightness-110 sm:w-auto"
      >
        <SubmitPending idle="Drop task for the room" />
      </button>
    </form>
  );
}
