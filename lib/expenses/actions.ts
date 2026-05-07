"use server";

import { revalidatePath } from "next/cache";

import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import {
  computeOwedFromLineAllocations,
  type LineAllocationPayload,
} from "@/lib/expenses/receipt-line-weights";
import { extractReceiptLines } from "@/lib/receipts/parse-extraction-lines";
import { shoppingCategoryLabel } from "@/lib/receipts/shopping-categories";
import type { ReceiptRow } from "@/lib/receipts/types";
import { createClient } from "@/lib/supabase/server";

function receiptExpenseTitle(
  row: Pick<ReceiptRow, "merchant" | "shopping_category">,
): string {
  const catLabel = shoppingCategoryLabel(row.shopping_category ?? undefined);
  const m = row.merchant?.trim() || "Receipt";
  return catLabel ? `[${catLabel}] ${m}` : m;
}

export type ExpenseActionState = { error?: string };

async function createExpenseFromReceiptCore(
  formData: FormData,
  mode: "all" | "selected",
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
      "id, household_id, created_by, merchant, total_amount, currency, purchased_at, shopping_category",
    )
    .eq("id", receiptId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (recErr?.message || !receipt) {
    console.error("[receipt->expense] receipt", recErr?.message);
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
    console.error("[receipt->expense] members", memErr?.message);
    return;
  }

  const allMemberIds = [
    ...new Set(
      members
        .map((m) => (m as { user_id: string }).user_id)
        .filter(Boolean),
    ),
  ];
  if (!allMemberIds.length) return;

  const selectedIds =
    mode === "all"
      ? allMemberIds
      : [...new Set(
          formData
            .getAll("split_user_ids")
            .map((x) => String(x).trim())
            .filter((x) => allMemberIds.includes(x)),
        )];
  if (!selectedIds.length) return;

  const receiptRow = receipt as {
    created_by: string;
    merchant: string | null;
    currency: string;
    purchased_at: string | null;
    shopping_category: string | null;
  };

  const paidByRaw = String(formData.get("paid_by_user_id") ?? "").trim();
  const paidBy = allMemberIds.includes(paidByRaw)
    ? paidByRaw
    : allMemberIds.includes(receiptRow.created_by)
      ? receiptRow.created_by
      : user.id;

  const expenseDate = receiptRow.purchased_at
    ? new Date(receiptRow.purchased_at).toISOString().slice(0, 10)
    : null;

  const { data: expenseId, error: rpcErr } = await supabase.rpc(
    "create_household_expense_with_splits",
    {
      p_household_id: householdId,
      p_title: receiptExpenseTitle({
        merchant: receiptRow.merchant,
        shopping_category: receiptRow.shopping_category,
      }),
      p_amount: total,
      p_currency: (receiptRow.currency || "EUR").slice(0, 8),
      p_expense_date: expenseDate,
      p_paid_by_user_id: paidBy,
      p_split_user_ids: selectedIds,
      p_split_weights: null,
    },
  );

  if (rpcErr?.message || !expenseId) {
    console.error("[receipt->expense] rpc", rpcErr?.message);
    return;
  }

  const { error: tagErr } = await supabase
    .from("household_expenses")
    .update({ source_receipt_id: receiptId })
    .eq("id", String(expenseId));
  if (tagErr?.message && !/source_receipt_id/i.test(tagErr.message)) {
    console.error("[receipt->expense] tag source", tagErr.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/finances");
  revalidatePath(`/dashboard/household/${householdId}`);
}

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
      p_split_weights: null,
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

export type SettleExpenseState = { ok?: boolean; error?: string };

export async function settleHouseholdExpense(
  _prev: SettleExpenseState | void,
  formData: FormData,
): Promise<SettleExpenseState> {
  const expenseId = String(formData.get("expense_id") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "").trim();
  if (!expenseId || !householdId) {
    return { error: "Missing expense." };
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

  const { data: row, error: fetchErr } = await supabase
    .from("household_expenses")
    .select("id, household_id, status")
    .eq("id", expenseId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (fetchErr?.message || !row) {
    console.error("[settleHouseholdExpense] fetch", fetchErr?.message);
    return {
      error: shouldExposeSupabaseError()
        ? fetchErr?.message ?? "Could not find expense."
        : PUBLIC_TRY_AGAIN,
    };
  }

  const status = (row as { status: string }).status;
  if (status === "settled") {
    return { ok: true };
  }

  const { error } = await supabase
    .from("household_expenses")
    .update({ status: "settled" })
    .eq("id", expenseId)
    .eq("household_id", householdId);

  if (error?.message) {
    console.error("[settleHouseholdExpense]", error.message);
    return {
      error: shouldExposeSupabaseError() ? error.message : PUBLIC_TRY_AGAIN,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/finances");
  revalidatePath(`/dashboard/household/${householdId}`);
  return { ok: true };
}

export async function createExpenseFromReceiptSplitAll(
  formData: FormData,
): Promise<void> {
  await createExpenseFromReceiptCore(formData, "all");
}

export async function createExpenseFromReceiptSelectedMembers(
  formData: FormData,
): Promise<void> {
  await createExpenseFromReceiptCore(formData, "selected");
}

export async function createExpenseFromReceiptLineSplits(
  formData: FormData,
): Promise<void> {
  const receiptId = String(formData.get("receipt_id") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "").trim();
  const paidByRaw = String(formData.get("paid_by_user_id") ?? "").trim();
  const rawAlloc = String(formData.get("allocation_json") ?? "").trim();
  if (!receiptId || !householdId || !rawAlloc) return;

  let allocation: LineAllocationPayload;
  try {
    allocation = JSON.parse(rawAlloc) as LineAllocationPayload;
  } catch {
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from("household_expenses")
    .select("id")
    .eq("source_receipt_id", receiptId)
    .maybeSingle();
  if (existing?.id) {
    revalidatePath(`/dashboard/household/${householdId}`);
    return;
  }

  const { data: receipt, error: recErr } = await supabase
    .from("receipts")
    .select(
      "id, household_id, created_by, merchant, total_amount, currency, purchased_at, shopping_category, extraction",
    )
    .eq("id", receiptId)
    .eq("household_id", householdId)
    .maybeSingle();

  if (recErr?.message || !receipt) {
    console.error("[receipt->expense lines]", recErr?.message);
    return;
  }

  const row = receipt as ReceiptRow;
  const total = Number(row.total_amount);
  if (!Number.isFinite(total) || total <= 0) return;

  const { data: members, error: memErr } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId);
  if (memErr?.message || !members?.length) return;

  const memberSet = new Set(
    members.map((m) => (m as { user_id: string }).user_id).filter(Boolean),
  );

  const lineItems = extractReceiptLines(row);
  const owedRaw = computeOwedFromLineAllocations({
    total,
    lineItems,
    allocation,
  });

  const cleaned = new Map<string, number>();
  for (const [uid, v] of owedRaw) {
    if (!memberSet.has(uid)) continue;
    if (v > 0.009) cleaned.set(uid, v);
  }

  let userIds = [...cleaned.keys()];
  let weights = userIds.map((u) => cleaned.get(u)!);
  let sumOwed = weights.reduce((a, b) => a + b, 0);

  if (userIds.length < 1 || sumOwed <= 0) return;

  if (Math.abs(sumOwed - total) > Math.max(0.06, total * 0.02)) {
    const scale = total / sumOwed;
    weights = weights.map((w) => w * scale);
    sumOwed = weights.reduce((a, b) => a + b, 0);
  }

  const paidBy = memberSet.has(paidByRaw)
    ? paidByRaw
    : memberSet.has(row.created_by)
      ? row.created_by
      : user.id;

  const expenseDate = row.purchased_at
    ? new Date(row.purchased_at).toISOString().slice(0, 10)
    : null;

  const { data: expenseId, error: rpcErr } = await supabase.rpc(
    "create_household_expense_with_splits",
    {
      p_household_id: householdId,
      p_title: receiptExpenseTitle(row),
      p_amount: total,
      p_currency: (row.currency || "EUR").slice(0, 8),
      p_expense_date: expenseDate,
      p_paid_by_user_id: paidBy,
      p_split_user_ids: userIds,
      p_split_weights: weights,
    },
  );

  if (rpcErr?.message || !expenseId) {
    console.error("[receipt->expense lines] rpc", rpcErr?.message);
    return;
  }

  const noteSummary = `Item split · ${lineItems.length} lines`;

  const { error: tagErr } = await supabase
    .from("household_expenses")
    .update({ source_receipt_id: receiptId, notes: noteSummary })
    .eq("id", String(expenseId));

  if (tagErr?.message && !/source_receipt_id/i.test(tagErr.message)) {
    console.error("[receipt->expense lines] tag", tagErr.message);
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/finances");
  revalidatePath(`/dashboard/household/${householdId}`);
}
