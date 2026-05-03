import { createClient } from "@/lib/supabase/server";

import type { HouseholdSummary } from "@/lib/households/queries";

export type ReceiptFeedPreviewItem = {
  id: string;
  householdId: string;
  householdName: string;
  merchant: string | null;
  totalAmount: number | null;
  currency: string;
  createdAt: string;
};

export async function loadReceiptFeedPreview(
  households: HouseholdSummary[],
  limit = 22,
): Promise<{ items: ReceiptFeedPreviewItem[]; error: string | null }> {
  if (households.length === 0) {
    return { items: [], error: null };
  }

  const supabase = await createClient();
  const ids = [...new Set(households.map((h) => h.id))];
  const { data, error } = await supabase
    .from("receipts")
    .select(
      "id, household_id, merchant, total_amount, currency, created_at",
    )
    .in("household_id", ids)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error?.message) {
    console.error("[receipts] feed preview", error.message);
    return { items: [], error: error.message };
  }

  const nameById = new Map(households.map((h) => [h.id, h.name]));

  const rows = (data ?? []) as Array<{
    id: string;
    household_id: string;
    merchant: string | null;
    total_amount: number | null;
    currency: string;
    created_at: string;
  }>;

  return {
    error: null,
    items: rows.map((r) => ({
      id: r.id,
      householdId: r.household_id,
      householdName: nameById.get(r.household_id) ?? "Household",
      merchant: r.merchant,
      totalAmount: r.total_amount !== null ? Number(r.total_amount) : null,
      currency: r.currency,
      createdAt: r.created_at,
    })),
  };
}
