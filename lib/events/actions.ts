"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";

import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { createClient } from "@/lib/supabase/server";

import type { BringItem } from "@/lib/events/queries";

export type EventActionState = { error?: string };

export async function createHouseholdEvent(
  _prev: EventActionState | void,
  formData: FormData,
): Promise<EventActionState | void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const startsAt = String(formData.get("starts_at") ?? "").trim();
  const endsRaw = String(formData.get("ends_at") ?? "").trim();
  const bringLines = String(formData.get("bring_list") ?? "");

  if (!householdId) return { error: "Missing household." };
  if (!title.length) return { error: "Add an event title." };
  if (!startsAt.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)) {
    return { error: "Start date/time looks invalid." };
  }

  const bringList: BringItem[] = bringLines
    .split("\n")
    .map((l) => l.trim())
    .filter(Boolean)
    .map((label) => ({
      id: randomUUID(),
      label,
      claimed_by: null,
    }));

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: shouldExposeSupabaseError() ? "Not signed in." : PUBLIC_TRY_AGAIN,
    };
  }

  const endsAt =
    endsRaw.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/) ||
    endsRaw.match(/^\d{4}-\d{2}-\d{2}$/)
      ? endsRaw.includes("T")
        ? endsRaw
        : `${endsRaw}T23:59:59`
      : null;

  const { error } = await supabase.from("household_events").insert({
    household_id: householdId,
    title,
    description: description.length ? description : null,
    starts_at: new Date(startsAt).toISOString(),
    ends_at: endsAt ? new Date(endsAt).toISOString() : null,
    bring_list: bringList,
    created_by: user.id,
  });

  if (error?.message) {
    console.error("[createHouseholdEvent]", error.message);
    return {
      error: shouldExposeSupabaseError()
        ? error.message
        : PUBLIC_TRY_AGAIN,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/household/${householdId}`);
}

export async function upsertEventRsvp(formData: FormData): Promise<void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const eventId = String(formData.get("event_id") ?? "").trim();
  const status = String(formData.get("status") ?? "going").trim() as
    | "going"
    | "maybe"
    | "not_going";

  if (!householdId || !eventId) return;

  const st =
    status === "maybe" || status === "not_going" ? status : ("going" as const);

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase.from("household_event_rsvps").upsert(
    {
      event_id: eventId,
      user_id: user.id,
      status: st,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "event_id,user_id" },
  );

  if (error?.message) {
    console.error("[upsertEventRsvp]", error.message);
    return;
  }

  revalidatePath(`/dashboard/household/${householdId}`);
}

export async function claimBringItem(formData: FormData): Promise<void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const eventId = String(formData.get("event_id") ?? "").trim();
  const itemId = String(formData.get("item_id") ?? "").trim();
  const unclaim = formData.get("unclaim") === "1";

  if (!householdId || !eventId || !itemId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: ev, error: fe } = await supabase
    .from("household_events")
    .select("bring_list")
    .eq("id", eventId)
    .maybeSingle();

  if (fe?.message || !ev) {
    console.error("[claimBringItem] fetch", fe?.message);
    return;
  }

  const raw = ev as { bring_list: unknown };
  const arr = Array.isArray(raw.bring_list) ? raw.bring_list : [];

  const next = arr.map((entry) => {
    const x = entry as Record<string, unknown>;
    if (String(x.id) !== itemId) return x;
    const cur = typeof x.claimed_by === "string" ? x.claimed_by : null;
    if (unclaim) {
      if (cur === user.id) {
        return { ...x, claimed_by: null };
      }
      return x;
    }
    if (cur && cur !== user.id) {
      return x;
    }
    return { ...x, claimed_by: user.id };
  });

  const { error } = await supabase
    .from("household_events")
    .update({
      bring_list: next,
    })
    .eq("id", eventId);

  if (error?.message) {
    console.error("[claimBringItem] update", error.message);
    return;
  }

  revalidatePath(`/dashboard/household/${householdId}`);
}
