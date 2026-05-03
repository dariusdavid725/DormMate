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
    <form action={formAction} className="mt-6 max-w-lg space-y-5">
      <input type="hidden" name="household_id" value={householdId} />

      {state?.error ? (
        <div
          role="alert"
          className="border-[3px] border-dm-danger bg-dm-elevated px-3 py-2 font-mono text-xs font-bold uppercase tracking-wide text-dm-danger"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="rename-household"
          className="mb-2 block font-mono text-[10px] font-black uppercase tracking-[0.22em] text-dm-muted"
        >
          Node label
        </label>
        <input
          id="rename-household"
          name="name"
          type="text"
          required
          minLength={1}
          maxLength={120}
          defaultValue={initialName}
          className="w-full rounded-none border-[3px] border-dm-border-strong bg-dm-bg px-3 py-2.5 text-sm font-medium text-dm-text outline-none focus:border-dm-electric"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-none border-[3px] border-dm-accent bg-dm-accent px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-[0.2em] text-dm-accent-ink shadow-[4px_4px_0_0_var(--dm-border-strong)] disabled:opacity-60"
      >
        {pending ? "Commit…" : "Commit rename"}
      </button>
    </form>
  );
}
