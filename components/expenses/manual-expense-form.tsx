"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createManualExpense,
  type ExpenseActionState,
} from "@/lib/expenses/actions";

function SubmitChip({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Saving…" : idle;
}

type MemberChip = {
  userId: string;
  label: string;
};

export function ManualExpenseForm({
  householdId,
  members,
  currentUserId,
  defaultCurrency,
}: {
  householdId: string;
  members: MemberChip[];
  currentUserId: string;
  defaultCurrency: string;
}) {
  const sorted = [...members].sort((a, b) => a.label.localeCompare(b.label));

  const [state, formAction] = useActionState<
    ExpenseActionState | null,
    FormData
  >(async (prev, fd) => (await createManualExpense(prev ?? undefined, fd)) ?? null, null);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="household_id" value={householdId} />

      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-dm-danger/40 bg-dm-surface px-3 py-2 text-sm text-dm-danger"
        >
          {state.error}
        </p>
      ) : null}

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          What was it?
        </span>
        <input
          type="text"
          name="title"
          required
          maxLength={200}
          placeholder="Groceries, pizza night, detergent…"
          className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm text-dm-text outline-none focus:border-dm-electric"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Amount
          </span>
          <input
            type="number"
            name="amount"
            step="0.01"
            min={0}
            placeholder="24.99"
            required
            className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm tabular-nums outline-none focus:border-dm-electric"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Currency
          </span>
          <input
            type="text"
            name="currency"
            defaultValue={defaultCurrency}
            maxLength={8}
            className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm uppercase outline-none focus:border-dm-electric"
          />
        </label>
      </div>

      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Date paid
        </span>
        <input
          type="date"
          name="expense_date"
          className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm outline-none focus:border-dm-electric"
        />
      </label>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Paid by
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {sorted.map((m) => (
            <label key={m.userId} className="inline-flex items-center gap-2">
              <input
                type="radio"
                name="paid_by_user_id"
                value={m.userId}
                required
                defaultChecked={m.userId === currentUserId}
              />
              <span className="text-sm text-dm-text">{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <fieldset className="space-y-2">
        <legend className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Split evenly between
        </legend>
        <p className="text-[11px] text-dm-muted">
          Everyone ticked owes an equal slice of the total.
        </p>
        <div className="mt-3 flex flex-wrap gap-3">
          {sorted.map((m) => (
            <label key={m.userId} className="inline-flex items-center gap-2">
              <input type="checkbox" name="split_user_ids" value={m.userId} />
              <span className="text-sm text-dm-text">{m.label}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <p className="rounded-lg border border-[var(--dm-border)] bg-dm-surface-mid/45 px-3 py-2 text-[11px] text-dm-muted">
        Tip: split only with people involved in the purchase to keep balances accurate.
      </p>

      <button
        type="submit"
        disabled={sorted.length === 0}
        className="rounded-lg bg-dm-electric px-5 py-2.5 text-sm font-semibold text-white shadow-[0_8px_18px_rgba(200,104,69,0.25)] hover:brightness-105 disabled:opacity-50"
      >
        <SubmitChip idle="Log expense" />
      </button>
    </form>
  );
}
