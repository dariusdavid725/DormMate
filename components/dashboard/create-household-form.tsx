"use client";

import { useActionState } from "react";

import {
  createHousehold,
  type HouseholdActionState,
} from "@/lib/households/actions";

const initial: HouseholdActionState = {};

export function CreateHouseholdForm({
  className = "mt-6 space-y-5",
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
          className="rounded-xl border border-dm-danger/30 bg-red-500/[0.06] px-3 py-2 text-sm font-medium text-dm-danger"
        >
          {state.error}
        </div>
      )}
      <div className="pb-1">
        <label
          htmlFor="household-name"
          className="mb-2 block text-xs font-semibold uppercase tracking-wide text-dm-muted"
        >
          Name
        </label>
        <input
          id="household-name"
          name="name"
          type="text"
          required
          maxLength={120}
          placeholder="e.g. Flat 12 · Tower B"
          className="w-full rounded-xl border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-3 text-sm text-dm-text outline-none ring-dm-electric/25 transition placeholder:text-dm-muted/70 focus:border-dm-electric focus:ring-2"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-full bg-dm-electric px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-black/10 transition hover:brightness-105 disabled:opacity-55 sm:w-auto sm:min-w-[10rem]"
      >
        {pending ? "Saving…" : "Create"}
      </button>
    </form>
  );
}
