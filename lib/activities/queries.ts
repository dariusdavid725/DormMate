import "server-only";

import { createClient } from "@/lib/supabase/server";

import type { HouseholdSummary } from "@/lib/households/queries";

export type ActivityRow = {
  id: string;
  household_id: string;
  kind: string;
  actor_user_id: string | null;
  subject_id: string | null;
  payload: Record<string, unknown>;
  created_at: string;
};

export async function loadHouseholdActivities(
  households: HouseholdSummary[],
  limit = 36,
): Promise<{ rows: ActivityRow[]; error: string | null }> {
  if (households.length === 0) {
    return { rows: [], error: null };
  }

  const supabase = await createClient();
  const ids = [...new Set(households.map((h) => h.id))];

  const { data, error } = await supabase
    .from("household_activities")
    .select(
      "id, household_id, kind, actor_user_id, subject_id, payload, created_at",
    )
    .in("household_id", ids)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error?.message) {
    console.error("[activities] load", error.message);
    return { rows: [], error: error.message };
  }

  return {
    rows: (data ?? []) as ActivityRow[],
    error: null,
  };
}
