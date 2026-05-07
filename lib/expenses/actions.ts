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

export async function createExpenseFromReceiptSplitAll(
  formData: FormData,
): Promise<void> {
  const receiptId = String(formData.get("receipt_id") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "").trim();
  if (!receiptId || !householdId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing, error: existingErr } = await supabase
    .from("household_expenses")
    .select("id")
    .eq("source_receipt_id", receiptId)
    .maybeSingle();
  if (!existingErr && existing?.id) {
    revalidatePath(`/dashboard/household/${householdId}`);
    return;
  }

  const { data: receipt, error: recErr } = await supabase
    .from("receipts")
    .select(
      "id, household_id, created_by, merchant, total_amount, currency, purchased_at",
    )
    .eq("id", receiptId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (recErr?.message || !receipt) {
    console.error("[createExpenseFromReceiptSplitAll] receipt", recErr?.message);
    return;
  }

  const total = Number(
    (receipt as { total_amount: number | string | null }).total_amount,
  );
  if (!Number.isFinite(total) || total <= 0) {
    return;
  }

  const { data: members, error: memErr } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId);
  if (memErr?.message || !members?.length) {
    console.error("[createExpenseFromReceiptSplitAll] members", memErr?.message);
    return;
  }

  const splitIds = [
    ...new Set(
      members
        .map((m) => (m as { user_id: string }).user_id)
        .filter(Boolean),
    ),
  ];
  if (!splitIds.length) return;

  const receiptRow = receipt as {
    created_by: string;
    merchant: string | null;
    currency: string;
    purchased_at: string | null;
  };

  const paidBy = splitIds.includes(receiptRow.created_by)
    ? receiptRow.created_by
    : user.id;

  const expenseDate = receiptRow.purchased_at
    ? new Date(receiptRow.purchased_at).toISOString().slice(0, 10)
    : null;

  const { data: expenseId, error: rpcErr } = await supabase.rpc(
    "create_household_expense_with_splits",
    {
      p_household_id: householdId,
      p_title: receiptRow.merchant?.trim() || "Receipt expense",
      p_amount: total,
      p_currency: (receiptRow.currency || "EUR").slice(0, 8),
      p_expense_date: expenseDate,
      p_paid_by_user_id: paidBy,
      p_split_user_ids: splitIds,
    },
  );

  if (rpcErr?.message || !expenseId) {
    console.error("[createExpenseFromReceiptSplitAll] rpc", rpcErr?.message);
    return;
  }

  const { error: tagErr } = await supabase
    .from("household_expenses")
    .update({ source_receipt_id: receiptId })
    .eq("id", String(expenseId));
  if (
    tagErr?.message &&
    !/source_receipt_id/i.test(tagErr.message)
  ) {
    console.error("[createExpenseFromReceiptSplitAll] tag source", tagErr.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/finances");
  revalidatePath(`/dashboard/household/${householdId}`);
}
