"use server";

import { revalidatePath } from "next/cache";

import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { createClient } from "@/lib/supabase/server";

export type TaskActionState = { error?: string };

export async function createHouseholdTask(
  _prev: TaskActionState | void,
  formData: FormData,
): Promise<TaskActionState | void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();
  const rewardLabelRaw = String(formData.get("reward_label") ?? "").trim();
  const pointsRaw = String(formData.get("reward_points") ?? "10").trim();
  const rewardPoints = Math.min(500, Math.max(1, Math.floor(Number(pointsRaw)) || 10));
  const assignedRaw = String(formData.get("assigned_to") ?? "").trim();
  const dueRaw = String(formData.get("due_at") ?? "").trim();

  if (!householdId) {
    return { error: "Choose a household." };
  }
  if (title.length < 1) {
    return { error: "Add a title for this chore." };
  }
  if (title.length > 140) {
    return { error: "Title is too long (max 140 characters)." };
  }

  const supabase = await createClient();

  const { data: auth } = await supabase.auth.getUser();
  const uid = auth.user?.id;
  if (!uid) {
    return {
      error: shouldExposeSupabaseError()
        ? "Not signed in."
        : PUBLIC_TRY_AGAIN,
    };
  }

  const uuidRe =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  const assigned_to = uuidRe.test(assignedRaw) ? assignedRaw : null;
  const due_at =
    dueRaw.match(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2})?/)
      ? new Date(dueRaw.includes("T") ? dueRaw : `${dueRaw}T23:59:59`).toISOString()
      : null;

  const { error: insertErr } = await supabase.from("household_tasks").insert({
    household_id: householdId,
    title,
    notes: notesRaw.length ? notesRaw : null,
    reward_points: rewardPoints,
    reward_label: rewardLabelRaw.length ? rewardLabelRaw : null,
    created_by: uid,
    assigned_to,
    due_at,
  });

  if (insertErr?.message) {
    console.error("[createHouseholdTask]", insertErr.message);
    return {
      error: shouldExposeSupabaseError()
        ? insertErr.message
        : PUBLIC_TRY_AGAIN,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/household/${householdId}`);
}

export async function completeHouseholdTaskForm(formData: FormData): Promise<void> {
  const taskId = String(formData.get("task_id") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "").trim();

  if (!taskId || !householdId) {
    return;
  }

  const supabase = await createClient();

  const { error: rpcErr } = await supabase.rpc("complete_household_task", {
    p_task_id: taskId,
  });

  if (rpcErr?.message) {
    console.error("[completeHouseholdTaskForm]", rpcErr.message);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/tasks");
  revalidatePath(`/dashboard/household/${householdId}`);
}
