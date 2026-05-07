import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type HouseholdExpenseRow = {
  id: string;
  householdId: string;
  sourceReceiptId: string | null;
  title: string;
  amount: number;
  currency: string;
  expenseDate: string;
  paidByUserId: string;
  status: "pending" | "settled";
  notes: string | null;
  createdBy: string;
  createdAt: string;
};

export const loadHouseholdExpenses = cache(async (householdId: string) => {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_expenses")
    .select(
      "id, household_id, source_receipt_id, title, amount, currency, expense_date, paid_by_user_id, status, notes, created_by, created_at",
    )
    .eq("household_id", householdId)
    .order("expense_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error?.message) {
    console.error("[expenses] list", error.message);
    return { error: error.message, expenses: [] as HouseholdExpenseRow[] };
  }

  const expenses = (data ?? []).map((r) => {
    const x = r as {
      id: string;
      household_id: string;
      source_receipt_id: string | null;
      title: string;
      amount: string | number;
      currency: string;
      expense_date: string;
      paid_by_user_id: string;
      status: string;
      notes: string | null;
      created_by: string;
      created_at: string;
    };
    return {
      id: x.id,
      householdId: x.household_id,
      sourceReceiptId: x.source_receipt_id,
      title: x.title,
      amount: Number(x.amount),
      currency: x.currency,
      expenseDate: x.expense_date,
      paidByUserId: x.paid_by_user_id,
      status: x.status === "settled" ? "settled" : "pending",
      notes: x.notes,
      createdBy: x.created_by,
      createdAt: x.created_at,
    } satisfies HouseholdExpenseRow;
  });

  return { error: null as string | null, expenses };
});

export async function loadExpenseSplits(expenseIds: string[]) {
  if (expenseIds.length === 0) {
    return {
      error: null as string | null,
      byExpense: new Map<string, string[]>(),
    };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("household_expense_splits")
    .select("expense_id, user_id")
    .in("expense_id", expenseIds);

  if (error?.message) {
    console.error("[expenses] splits", error.message);
    return {
      error: error.message,
      byExpense: new Map<string, string[]>(),
    };
  }

  const byExpense = new Map<string, string[]>();
  for (const raw of data ?? []) {
    const row = raw as { expense_id: string; user_id: string };
    const list = byExpense.get(row.expense_id) ?? [];
    list.push(row.user_id);
    byExpense.set(row.expense_id, list);
  }

  return { error: null as string | null, byExpense };
}

export type BalanceRow = {
  userId: string;
  netAmount: number;
};

export async function loadHouseholdExpenseBalances(householdId: string): Promise<{
  balances: BalanceRow[];
  error: string | null;
}> {
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("household_expense_net_balances", {
    p_household_id: householdId,
  });

  if (error?.message) {
    console.error("[expenses] balances rpc", error.message);
    return { balances: [], error: error.message };
  }

  type RpcRow = { user_id: string; net_amount: string | number };
  const rows = (data ?? []) as RpcRow[];

  return {
    error: null,
    balances: rows.map((r) => ({
      userId: r.user_id,
      netAmount: Number(r.net_amount),
    })),
  };
}
