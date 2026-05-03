"use client";

import { useActionState } from "react";

import {
  type RenameHouseholdState,
  updateHouseholdName,
} from "@/lib/households/actions";

const initial: RenameHouseholdState = {};

export function RenameHouseholdForm({
  householdId,
  initialName,
}: {
  householdId: string;
  initialName: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateHouseholdName,
    initial,
  );

  return (
    <form action={formAction} className="mt-6 max-w-lg space-y-4">
      <input type="hidden" name="household_id" value={householdId} />

      {state?.error ? (
        <div
          role="alert"
          className="rounded-xl border border-dm-danger/30 bg-red-500/[0.06] px-3 py-2 text-sm font-medium text-dm-danger"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="rename-household"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-dm-muted"
        >
          Display name
        </label>
        <input
          id="rename-household"
          name="name"
          type="text"
          required
          minLength={1}
          maxLength={120}
          defaultValue={initialName}
          className="w-full rounded-xl border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-2.5 text-sm text-dm-text outline-none focus:border-dm-electric focus:ring-2 focus:ring-dm-electric/20"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-[var(--dm-accent)] px-6 py-2.5 text-sm font-semibold text-[var(--dm-accent-ink)] shadow-sm transition hover:brightness-105 disabled:opacity-55"
      >
        {pending ? "Saving…" : "Save name"}
      </button>
    </form>
  );
}
