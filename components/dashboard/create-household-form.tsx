"use client";

import { useActionState } from "react";

import {
  createHousehold,
  type HouseholdActionState,
} from "@/lib/households/actions";

const initial: HouseholdActionState = {};

export function CreateHouseholdForm({
  className = "mt-6 space-y-4",
}: {
  className?: string;
}) {
  const [state, formAction, pending] = useActionState(
    createHousehold,
    initial,
  );

  return (
    <form action={formAction} className={className}>
      {state?.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200"
        >
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="household-name"
          className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Household name
        </label>
        <input
          id="household-name"
          name="name"
          type="text"
          required
          maxLength={120}
          placeholder="e.g. 4B Linden Hall, Flat 12"
          className="w-full rounded-xl border border-zinc-300 bg-white px-3 py-2.5 text-sm text-zinc-900 shadow-sm outline-none ring-emerald-500/30 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-60"
      >
        {pending ? "Creating…" : "Create household"}
      </button>
    </form>
  );
}
