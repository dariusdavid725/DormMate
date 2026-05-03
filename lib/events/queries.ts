import "server-only";

import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type BringItem = {
  id: string;
  label: string;
  claimed_by: string | null;
};

export type HouseholdEventRow = {
  id: string;
  householdId: string;
  title: string;
  description: string | null;
  startsAt: string;
  endsAt: string | null;
  bringList: BringItem[];
  createdBy: string;
  createdAt: string;
};

export type EventRsvpRow = {
  eventId: string;
  userId: string;
  status: "going" | "maybe" | "not_going";
  updatedAt: string;
};

function parseBringList(raw: unknown): BringItem[] {
  if (!Array.isArray(raw)) return [];
  const out: BringItem[] = [];
  for (const x of raw) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    const id = typeof o.id === "string" ? o.id : "";
    const label = typeof o.label === "string" ? o.label : "";
    const claimed_by =
      typeof o.claimed_by === "string" ? o.claimed_by : null;
    if (id.length && label.length) {
      out.push({ id, label, claimed_by });
    }
  }
  return out;
}

export const loadHouseholdEvents = cache(async (householdId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("household_events")
    .select(
      "id, household_id, title, description, starts_at, ends_at, bring_list, created_by, created_at",
    )
    .eq("household_id", householdId)
    .order("starts_at", { ascending: true });

  if (error?.message) {
    console.error("[events] list", error.message);
    return { error: error.message, events: [] as HouseholdEventRow[] };
  }

  const events = (data ?? []).map((r) => {
    const x = r as {
      id: string;
      household_id: string;
      title: string;
      description: string | null;
      starts_at: string;
      ends_at: string | null;
      bring_list: unknown;
      created_by: string;
      created_at: string;
    };
    return {
      id: x.id,
      householdId: x.household_id,
      title: x.title,
      description: x.description,
      startsAt: x.starts_at,
      endsAt: x.ends_at,
      bringList: parseBringList(x.bring_list),
      createdBy: x.created_by,
      createdAt: x.created_at,
    } satisfies HouseholdEventRow;
  });

  return { error: null as string | null, events };
});

export async function loadEventRsvps(eventIds: string[]) {
  if (eventIds.length === 0) {
    return { error: null as string | null, rsvps: [] as EventRsvpRow[] };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("household_event_rsvps")
    .select("event_id, user_id, status, updated_at")
    .in("event_id", eventIds);

  if (error?.message) {
    console.error("[events] rsvps", error.message);
    return { error: error.message, rsvps: [] as EventRsvpRow[] };
  }

  const rsvps = (data ?? []).map((raw) => {
    const x = raw as {
      event_id: string;
      user_id: string;
      status: string;
      updated_at: string;
    };
    const st =
      x.status === "maybe" || x.status === "not_going" ? x.status : "going";
    return {
      eventId: x.event_id,
      userId: x.user_id,
      status: st as EventRsvpRow["status"],
      updatedAt: x.updated_at,
    };
  });

  return { error: null as string | null, rsvps };
}
