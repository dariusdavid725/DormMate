"use server";

import { revalidatePath } from "next/cache";

import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { createClient } from "@/lib/supabase/server";

export type ExpenseActionState = { error?: string };

export async function createManualExpense(
  _prev: ExpenseActionState | void,
  formData: FormData,
): Promise<ExpenseActionState | void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const amountRaw = String(formData.get("amount") ?? "").trim();
  const currency = String(formData.get("currency") ?? "EUR").trim() || "EUR";
  const expenseDate = String(formData.get("expense_date") ?? "").trim();
  const paidBy = String(formData.get("paid_by_user_id") ?? "").trim();
  const splitIds = formData.getAll("split_user_ids").map((v) =>
    String(v).trim(),
  );

  if (!householdId) return { error: "Missing household." };
  if (title.length < 1) return { error: "Add a title." };
  const amount = Number(amountRaw);
  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Enter a valid amount." };
  }
  if (!paidBy) return { error: "Choose who paid." };

  const splitClean = [...new Set(splitIds.filter(Boolean))];

  if (splitClean.length < 1) {
    return { error: "Pick at least one person splitting the cost." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return {
      error: shouldExposeSupabaseError() ? "Not signed in." : PUBLIC_TRY_AGAIN,
    };
  }

  const date =
    expenseDate.match(/^\d{4}-\d{2}-\d{2}$/) ? expenseDate : undefined;

  const { data: expenseId, error: rpcErr } = await supabase.rpc(
    "create_household_expense_with_splits",
    {
      p_household_id: householdId,
      p_title: title,
      p_amount: amount,
      p_currency: currency.slice(0, 8),
      p_expense_date: date ?? null,
      p_paid_by_user_id: paidBy,
      p_split_user_ids: splitClean,
    },
  );

  if (rpcErr?.message || !expenseId) {
    console.error("[createManualExpense]", rpcErr?.message);
    return {
      error: shouldExposeSupabaseError()
        ? rpcErr?.message ?? "Could not save expense."
        : PUBLIC_TRY_AGAIN,
    };
  }

  void expenseId;

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/finances");
  revalidatePath(`/dashboard/household/${householdId}`);
}

export async function settleHouseholdExpense(formData: FormData): Promise<void> {
  const expenseId = String(formData.get("expense_id") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "").trim();
  if (!expenseId || !householdId) return;

  const supabase = await createClient();
  const { error } = await supabase
    .from("household_expenses")
    .update({ status: "settled" })
    .eq("id", expenseId);

  if (error?.message) {
    console.error("[settleHouseholdExpense]", error.message);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/finances");
  revalidatePath(`/dashboard/household/${householdId}`);
}
