"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

import {
  settleHouseholdExpense,
  type SettleExpenseState,
} from "@/lib/expenses/actions";

const initial: SettleExpenseState = {};

export function SettleExpenseForm({
  householdId,
  expenseId,
}: {
  householdId: string;
  expenseId: string;
}) {
  const router = useRouter();
  const sawOk = useRef(false);
  const [state, formAction, pending] = useActionState(
    settleHouseholdExpense,
    initial,
  );

  useEffect(() => {
    if (state?.ok && !sawOk.current) {
      sawOk.current = true;
      router.refresh();
    }
  }, [state?.ok, router]);

  return (
    <form action={formAction} className="flex max-w-[14rem] flex-col items-end gap-1">
      <input type="hidden" name="household_id" value={householdId} />
      <input type="hidden" name="expense_id" value={expenseId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/80 px-3 py-1.5 text-[11px] font-semibold text-dm-text transition hover:border-dm-electric hover:text-dm-electric disabled:pointer-events-none disabled:opacity-55"
      >
        {pending ? "Saving…" : "We settled up — close bill"}
      </button>
      {state?.error ? (
        <p role="alert" className="text-right text-[11px] text-dm-danger">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-right text-[11px] text-dm-muted" role="status">
          Saved.
        </p>
      ) : null}
    </form>
  );
}
