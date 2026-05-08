"use client";

import { useActionState } from "react";

import {
  type HouseholdCurrencyState,
  updateHouseholdCurrency,
} from "@/lib/households/actions";

const INITIAL: HouseholdCurrencyState = {};

const OPTIONS = ["RON", "EUR", "USD", "GBP", "HUF", "PLN"] as const;

export function HouseholdCurrencyForm({
  householdId,
  currentCurrency,
}: {
  householdId: string;
  currentCurrency: string;
}) {
  const [state, action, pending] = useActionState(updateHouseholdCurrency, INITIAL);

  return (
    <form action={action} className="mt-5 max-w-xs space-y-2">
      <input type="hidden" name="household_id" value={householdId} />
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Household currency
        </span>
        <select
          name="currency"
          defaultValue={currentCurrency}
          className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm"
        >
          {OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {opt}
            </option>
          ))}
        </select>
      </label>
      {state?.error ? (
        <p className="text-xs text-dm-danger" role="alert">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-xs text-dm-muted" role="status">
          Currency updated.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-text hover:border-dm-electric"
      >
        {pending ? "Saving..." : "Save currency"}
      </button>
    </form>
  );
}
