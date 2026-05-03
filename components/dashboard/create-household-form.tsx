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
          className="border-[3px] border-dm-danger bg-dm-elevated px-3 py-2 text-sm font-medium text-dm-danger"
        >
          {state.error}
        </div>
      )}
      <div>
        <label
          htmlFor="household-name"
          className="mb-1.5 block font-mono text-[10px] font-black uppercase tracking-[0.2em] text-dm-muted"
        >
          Household name
        </label>
        <input
          id="household-name"
          name="name"
          type="text"
          required
          maxLength={120}
          placeholder="Flat 09 · Linden"
          className="w-full rounded-none border-[3px] border-dm-border-strong bg-dm-bg px-3 py-2.5 text-sm font-medium text-dm-text outline-none ring-0 placeholder:text-dm-muted focus:border-dm-electric"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="rounded-none border-[3px] border-dm-accent bg-dm-accent px-4 py-2.5 font-mono text-[11px] font-black uppercase tracking-widest text-dm-accent-ink shadow-[4px_4px_0_0_var(--dm-border-strong)] transition hover:-translate-y-px disabled:opacity-60"
      >
        {pending ? "Staging…" : "Commit dorm"}
      </button>
    </form>
  );
}
