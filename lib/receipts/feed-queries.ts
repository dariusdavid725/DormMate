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
  /** Who saved this receipt (best-effort from profiles). */
  savedByLabel: string;
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
      "id, household_id, merchant, total_amount, currency, created_at, created_by",
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
    created_by: string;
  }>;

  const creatorIds = [
    ...new Set(rows.map((r) => r.created_by).filter(Boolean)),
  ];

  let displayByUserId = new Map<string, string | null>();
  if (creatorIds.length > 0) {
    const { data: profs, error: pe } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", creatorIds);

    if (pe?.message) {
      console.error("[receipts] feed creator profiles", pe.message);
    }

    displayByUserId = new Map(
      (profs ?? []).map((p) => [
        (p as { id: string }).id,
        (p as { display_name: string | null }).display_name,
      ]),
    );
  }

  function labelForSaver(userId: string) {
    const raw = displayByUserId.get(userId)?.trim();
    if (raw?.length) return raw;
    return "Someone";
  }

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
      savedByLabel: labelForSaver(r.created_by),
    })),
  };
}
