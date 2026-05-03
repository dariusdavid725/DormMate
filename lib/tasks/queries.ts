import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type HouseholdTaskRow = {
  id: string;
  householdId: string;
  householdName: string;
  title: string;
  notes: string | null;
  rewardPoints: number;
  rewardLabel: string | null;
  status: "open" | "done";
  createdAt: string;
  assignedToUserId: string | null;
  dueAt: string | null;
  completedByUserId: string | null;
  completedAt: string | null;
};

type RawJoined = {
  id: string;
  household_id: string;
  title: string;
  notes: string | null;
  reward_points: number;
  reward_label: string | null;
  status: string;
  created_at: string;
  assigned_to: string | null;
  due_at: string | null;
  completed_by: string | null;
  completed_at: string | null;
  households:
    | { name: string }
    | [{ name: string }]
    | null;
};

const selectTasks =
  "id, household_id, title, notes, reward_points, reward_label, status, created_at, assigned_to, due_at, completed_by, completed_at, households(name)";

function mapRaw(r: RawJoined): HouseholdTaskRow | null {
  const h = r.households;
  let name = "Household";
  if (Array.isArray(h)) {
    name = h[0]?.name ?? name;
  } else if (h && typeof h === "object" && "name" in h) {
    name = h.name ?? name;
  }
  const st = r.status === "done" ? "done" : "open";
  return {
    id: r.id,
    householdId: r.household_id,
    householdName: name,
    title: r.title,
    notes: r.notes,
    rewardPoints: r.reward_points,
    rewardLabel: r.reward_label,
    status: st,
    createdAt: r.created_at,
    assignedToUserId: r.assigned_to,
    dueAt: r.due_at,
    completedByUserId: r.completed_by,
    completedAt: r.completed_at,
  };
}

export const loadOpenTasksForUser = cache(async (userId: string) => {
  const supabase = await createClient();
  const { data: userRow } = await supabase.auth.getUser();
  if (!userRow.user?.id || userRow.user.id !== userId) {
    return { error: null as string | null, tasks: [] as HouseholdTaskRow[] };
  }

  const { data, error } = await supabase
    .from("household_tasks")
    .select(selectTasks)
    .eq("status", "open")
    .or(`assigned_to.is.null,assigned_to.eq.${userId}`)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("[tasks] load open for user", error.message);
    return { error: error.message, tasks: [] as HouseholdTaskRow[] };
  }

  const tasks = (data ?? [])
    .map((row) => mapRaw(row as RawJoined))
    .filter((x): x is HouseholdTaskRow => x !== null);

  return { error: null as string | null, tasks };
});

export async function loadOpenTasksForHousehold(householdId: string) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_tasks")
    .select(selectTasks)
    .eq("household_id", householdId)
    .eq("status", "open")
    .order("created_at", { ascending: true });

  if (error) {
    console.error("[tasks] load open for household", error.message);
    return { error: error.message, tasks: [] as HouseholdTaskRow[] };
  }

  const tasks = (data ?? [])
    .map((row) => mapRaw(row as RawJoined))
    .filter((x): x is HouseholdTaskRow => x !== null);

  return { error: null as string | null, tasks };
}

export async function loadCompletedTasksForHousehold(
  householdId: string,
  take = 30,
) {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_tasks")
    .select(selectTasks)
    .eq("household_id", householdId)
    .eq("status", "done")
    .order("completed_at", { ascending: false })
    .limit(take);

  if (error) {
    console.error("[tasks] load done for household", error.message);
    return { error: error.message, tasks: [] as HouseholdTaskRow[] };
  }

  const tasks = (data ?? [])
    .map((row) => mapRaw(row as RawJoined))
    .filter((x): x is HouseholdTaskRow => x !== null);

  return { error: null as string | null, tasks };
}

export async function loadRecentCompletedTasksForUser(
  householdIds: string[],
  limit = 22,
) {
  if (householdIds.length === 0) {
    return { error: null as string | null, tasks: [] as HouseholdTaskRow[] };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("household_tasks")
    .select(selectTasks)
    .in("household_id", householdIds)
    .eq("status", "done")
    .order("completed_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("[tasks] recent done households", error.message);
    return { error: error.message, tasks: [] as HouseholdTaskRow[] };
  }

  const tasks = (data ?? [])
    .map((row) => mapRaw(row as RawJoined))
    .filter((x): x is HouseholdTaskRow => x !== null);

  return { error: null as string | null, tasks };
}
