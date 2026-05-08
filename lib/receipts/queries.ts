import { cache } from "react";

import type { ReceiptRow } from "@/lib/receipts/types";
import { createClient } from "@/lib/supabase/server";

export const loadReceiptsForHousehold = cache(async (householdId: string) => {
  const supabase = await createClient();
  const selectWithCategory =
    "id, household_id, created_by, merchant, total_amount, currency, purchased_at, source_filename, shopping_category, extraction, created_at";
  const selectWithoutCategory =
    "id, household_id, created_by, merchant, total_amount, currency, purchased_at, source_filename, extraction, created_at";

  let { data, error } = await supabase
    .from("receipts")
    .select(selectWithCategory)
    .eq("household_id", householdId)
    .order("created_at", { ascending: false })
    .limit(50);

  if (
    error?.message &&
    (error.message.includes("shopping_category")
      || error.message.includes("column receipts.shopping_category"))
  ) {
    const retried = await supabase
      .from("receipts")
      .select(selectWithoutCategory)
      .eq("household_id", householdId)
      .order("created_at", { ascending: false })
      .limit(50);
    data = (retried.data ?? []).map((row) => ({
      ...row,
      shopping_category: null,
    }));
    error = retried.error;
  }

  if (error?.message) {
    console.error("[receipts] list", error.message);
    return { error: error.message, receipts: [] as ReceiptRow[] };
  }

  return {
    error: null as string | null,
    receipts: (data ?? []) as ReceiptRow[],
  };
});
