import { createClient } from "@/lib/supabase/server";

import type { ReceiptFeedPreviewItem } from "@/lib/receipts/feed-queries";

export function countReceiptsSince(
  items: ReceiptFeedPreviewItem[],
  days: number,
): number {
  if (days <= 0 || items.length === 0) return 0;
  const cutoff = Date.now() - days * 86400000;
  return items.filter((i) => new Date(i.createdAt).getTime() >= cutoff).length;
}

/** Distinct household peers across the given spaces (excludes current user). */
export async function loadDistinctHousemateCount(
  householdIds: string[],
  currentUserId: string,
): Promise<number> {
  if (householdIds.length === 0) return 0;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("household_members")
    .select("user_id")
    .in("household_id", householdIds);

  if (error?.message) {
    console.error("[home-metrics] housemate count", error.message);
    return 0;
  }

  const ids = new Set(
    (data ?? []).map((r: { user_id: string }) => r.user_id),
  );
  ids.delete(currentUserId);
  return ids.size;
}
