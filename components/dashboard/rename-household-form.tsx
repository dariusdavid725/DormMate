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
          className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/55 dark:text-red-200"
        >
          {state.error}
        </div>
      ) : null}

      <div>
        <label
          htmlFor="rename-household"
          className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-zinc-500 dark:text-zinc-400"
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
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none ring-emerald-500/35 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>

      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
