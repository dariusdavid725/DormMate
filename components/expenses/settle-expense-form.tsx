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
    <form
      action={formAction}
      className="flex max-w-[14rem] flex-col items-end gap-1 max-lg:max-w-full max-lg:items-stretch"
    >
      <input type="hidden" name="household_id" value={householdId} />
      <input type="hidden" name="expense_id" value={expenseId} />
      <button
        type="submit"
        disabled={pending}
        className="rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/80 px-3 py-1.5 text-[11px] font-semibold text-dm-text transition hover:border-dm-electric hover:text-dm-electric disabled:pointer-events-none disabled:opacity-55 max-lg:min-h-[48px] max-lg:w-full max-lg:rounded-xl max-lg:px-4 max-lg:py-3 max-lg:text-[13px] max-lg:leading-snug lg:w-auto lg:py-1.5 lg:text-[11px]"
      >
        {pending ? "Saving…" : "We settled up — close bill"}
      </button>
      {state?.error ? (
        <p role="alert" className="text-right text-[11px] text-dm-danger max-lg:text-left max-lg:text-[13px]">
          {state.error}
        </p>
      ) : null}
      {state?.ok ? (
        <p className="text-right text-[11px] text-dm-muted max-lg:text-left max-lg:text-[13px]" role="status">
          Saved.
        </p>
      ) : null}
    </form>
  );
}
