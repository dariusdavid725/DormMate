import { createClient } from "@/lib/supabase/server";

import type { HouseholdSummary } from "@/lib/households/queries";
import type { ReceiptFeedPreviewItem } from "@/lib/receipts/feed-queries";

export type HouseActivityItem =
  | {
      kind: "receipt_saved";
      id: string;
      at: string;
      householdId: string;
      householdName: string;
      merchant: string | null;
      amountLabel: string;
      savedByLabel: string;
    }
  | {
      kind: "chore_done";
      id: string;
      at: string;
      householdId: string;
      householdName: string;
      title: string;
      points: number;
      completedByLabel: string;
    };

function formatMoney(amount: number | null, currency: string) {
  if (amount === null || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: currency || "EUR",
      minimumFractionDigits: 2,
    }).format(amount);
  } catch {
    return `${amount?.toFixed(2) ?? "—"} ${currency}`;
  }
}

export async function loadHouseActivityItems(
  households: HouseholdSummary[],
  receiptItems: ReceiptFeedPreviewItem[],
  limit = 22,
): Promise<{ items: HouseActivityItem[]; error: string | null }> {
  if (households.length === 0) {
    return { items: [], error: null };
  }

  const supabase = await createClient();
  const ids = [...new Set(households.map((h) => h.id))];
  const nameById = new Map(households.map((h) => [h.id, h.name]));

  const { data: doneRaw, error: taskErr } = await supabase
    .from("household_tasks")
    .select(
      "id, household_id, title, completed_at, completed_by, reward_points",
    )
    .in("household_id", ids)
    .eq("status", "done")
    .not("completed_at", "is", null)
    .order("completed_at", { ascending: false })
    .limit(24);

  if (taskErr?.message) {
    console.error("[house-activity] completed tasks", taskErr.message);
  }

  const doneRows = (doneRaw ?? []) as Array<{
    id: string;
    household_id: string;
    title: string;
    completed_at: string;
    completed_by: string | null;
    reward_points: number;
  }>;

  const completerIds = [
    ...new Set(
      doneRows.map((r) => r.completed_by).filter((x): x is string => !!x),
    ),
  ];

  let nameByUser = new Map<string, string | null>();
  if (completerIds.length > 0) {
    const { data: profs, error: pe } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", completerIds);

    if (pe?.message) {
      console.error("[house-activity] completer profiles", pe.message);
    }

    nameByUser = new Map(
      (profs ?? []).map((p) => [
        (p as { id: string }).id,
        (p as { display_name: string | null }).display_name,
      ]),
    );
  }

  function labelFor(userId: string | null) {
    if (!userId) return "Someone";
    const n = nameByUser.get(userId)?.trim();
    return n?.length ? n : "Someone";
  }

  const merged: HouseActivityItem[] = [];

  for (const r of receiptItems) {
    merged.push({
      kind: "receipt_saved",
      id: r.id,
      at: r.createdAt,
      householdId: r.householdId,
      householdName: r.householdName,
      merchant: r.merchant,
      amountLabel: formatMoney(r.totalAmount, r.currency),
      savedByLabel: r.savedByLabel,
    });
  }

  for (const t of doneRows) {
    merged.push({
      kind: "chore_done",
      id: t.id,
      at: t.completed_at,
      householdId: t.household_id,
      householdName: nameById.get(t.household_id) ?? "Household",
      title: t.title,
      points: t.reward_points,
      completedByLabel: labelFor(t.completed_by),
    });
  }

  merged.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const seen = new Set<string>();
  const deduped: HouseActivityItem[] = [];
  for (const x of merged) {
    const k = `${x.kind}:${x.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(x);
    if (deduped.length >= limit) break;
  }

  return { items: deduped, error: taskErr?.message ?? null };
}
