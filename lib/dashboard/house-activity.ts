import { createClient } from "@/lib/supabase/server";

import { loadHouseholdActivities } from "@/lib/activities/queries";
import type { HouseholdSummary } from "@/lib/households/queries";

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
    }
  | {
      kind: "generic_note";
      id: string;
      at: string;
      householdId: string;
      householdName: string;
      label: string;
      body: string;
      href?: string;
    };

function formatMoney(amount: unknown, currency: unknown) {
  const n =
    typeof amount === "number" ? amount : Number(amount);
  const cur = typeof currency === "string" ? currency : "EUR";
  if (amount == null || Number.isNaN(n)) return "—";
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: cur || "EUR",
      minimumFractionDigits: 2,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${cur}`;
  }
}

export async function loadHouseActivityItems(
  households: HouseholdSummary[],
  limit = 24,
): Promise<{ items: HouseActivityItem[]; error: string | null }> {
  if (households.length === 0) {
    return { items: [], error: null };
  }

  const supabase = await createClient();
  const nameByHouseId = new Map(households.map((h) => [h.id, h.name]));

  const { rows: activities, error: actErr } =
    await loadHouseholdActivities(households, limit * 2);

  const actorIds = [
    ...new Set(
      activities.map((a) => a.actor_user_id).filter((x): x is string => !!x),
    ),
  ];

  let displayByUser = new Map<string, string | null>();
  if (actorIds.length > 0) {
    const { data: profs, error: pe } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", actorIds);

    if (pe?.message) {
      console.error("[house-activity] actors", pe.message);
    }

    displayByUser = new Map(
      (profs ?? []).map((p) => [
        (p as { id: string }).id,
        (p as { display_name: string | null }).display_name,
      ]),
    );
  }

  function actorLabel(uid: string | null) {
    if (!uid) return "Someone";
    const raw = displayByUser.get(uid)?.trim();
    return raw?.length ? raw : "Someone";
  }

  const items: HouseActivityItem[] = [];

  for (const row of activities) {
    const householdName =
      nameByHouseId.get(row.household_id) ?? "Household";
    const pl = row.payload ?? {};
    const at = row.created_at;

    if (row.kind === "receipt_saved") {
      items.push({
        kind: "receipt_saved",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        merchant:
          typeof pl.merchant === "string" ? pl.merchant : null,
        amountLabel: formatMoney(pl.total, pl.currency),
        savedByLabel: actorLabel(row.actor_user_id),
      });
      continue;
    }

    if (row.kind === "task_completed") {
      items.push({
        kind: "chore_done",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        title:
          typeof pl.title === "string"
            ? pl.title
            : "Chore",
        points:
          typeof pl.points === "number"
            ? pl.points
            : Math.floor(Number(pl.points ?? 0)) || 0,
        completedByLabel: actorLabel(row.actor_user_id),
      });
      continue;
    }

    if (row.kind === "household_created") {
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "Flat pinned",
        body:
          typeof pl.name === "string"
            ? `${pl.name} is on the corkboard`
            : "Household started",
      });
      continue;
    }

    if (row.kind === "member_joined") {
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "New roommate",
        body: `${actorLabel(row.actor_user_id)} joined`,
      });
      continue;
    }

    if (row.kind === "member_joined_via_invite") {
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "Invite accepted",
        body: `${actorLabel(row.actor_user_id)} joined using an invite link`,
        href: `/dashboard/household/${row.household_id}?view=members`,
      });
      continue;
    }

    if (row.kind === "task_created") {
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "New chore",
        body:
          typeof pl.title === "string"
            ? `${actorLabel(row.actor_user_id)} added “${pl.title}”`
            : `${actorLabel(row.actor_user_id)} added a chore`,
        href: `/dashboard/household/${row.household_id}?view=tasks`,
      });
      continue;
    }

    if (row.kind === "expense_added") {
      const title =
        typeof pl.title === "string" ? pl.title : "Expense";
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "Expense logged",
        body: `${title} · ${formatMoney(pl.amount, pl.currency)}`,
        href: `/dashboard/household/${row.household_id}?view=expenses`,
      });
      continue;
    }

    if (row.kind === "grocery_added") {
      const title =
        typeof pl.name === "string" ? pl.name : "Grocery item";
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "Grocery added",
        body: `${title} added to the list`,
        href: `/dashboard/inventory?household=${row.household_id}`,
      });
      continue;
    }

    if (row.kind === "grocery_bought") {
      const title =
        typeof pl.name === "string" ? pl.name : "Grocery item";
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "Grocery bought",
        body: `${title} marked bought`,
        href: `/dashboard/inventory?household=${row.household_id}`,
      });
      continue;
    }

    if (row.kind === "profile_updated") {
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "Profile updated",
        body: `${actorLabel(row.actor_user_id)} updated their profile`,
        href: "/dashboard/settings",
      });
      continue;
    }

    if (row.kind === "currency_changed") {
      const cur =
        typeof pl.currency === "string" ? pl.currency.toUpperCase() : "RON";
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "Currency changed",
        body: `Household currency is now ${cur}`,
        href: `/dashboard/household/${row.household_id}`,
      });
      continue;
    }

    if (row.kind === "event_created") {
      const title =
        typeof pl.title === "string" ? pl.title : "Event";
      items.push({
        kind: "generic_note",
        id: row.id,
        at,
        householdId: row.household_id,
        householdName,
        label: "On the calendar",
        body:
          typeof pl.starts_at === "string"
            ? `${title}`
            : `${title}`,
        href: `/dashboard/household/${row.household_id}?view=events`,
      });
      continue;
    }

    /* Unknown kinds — skip to avoid noisy feed */
  }

  items.sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());

  const deduped: HouseActivityItem[] = [];
  const seen = new Set<string>();
  for (const x of items) {
    const k = `${x.kind}:${x.id}`;
    if (seen.has(k)) continue;
    seen.add(k);
    deduped.push(x);
    if (deduped.length >= limit) break;
  }

  return { items: deduped, error: actErr ?? null };
}
