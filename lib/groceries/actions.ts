"use server";

import { revalidatePath } from "next/cache";

import { PUBLIC_TRY_AGAIN, shouldExposeSupabaseError } from "@/lib/errors/public";
import { createClient } from "@/lib/supabase/server";

const PRIORITIES = new Set(["low", "medium", "high"]);

export type GroceryActionState = {
  error?: string;
  ok?: boolean;
};

export async function createGroceryItem(
  _prev: GroceryActionState | void,
  formData: FormData,
): Promise<GroceryActionState> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const quantity = String(formData.get("quantity") ?? "1").trim() || "1";
  const category = String(formData.get("category") ?? "General").trim() || "General";
  const rawPriority = String(formData.get("priority") ?? "medium")
    .trim()
    .toLowerCase();
  const assignedToRaw = String(formData.get("assigned_to") ?? "").trim();
  const notesRaw = String(formData.get("notes") ?? "").trim();

  if (!householdId) return { error: "Missing household." };
  if (!name) return { error: "Add grocery item name." };
  if (name.length > 140) return { error: "Name too long (max 140)." };
  if (quantity.length > 40) return { error: "Quantity too long (max 40)." };
  if (category.length > 40) return { error: "Category too long (max 40)." };
  if (notesRaw.length > 300) return { error: "Notes too long (max 300)." };
  const priority = PRIORITIES.has(rawPriority) ? rawPriority : "medium";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { error: "Not signed in." };

  const assignedTo = assignedToRaw.length > 0 ? assignedToRaw : null;
  const notes = notesRaw.length > 0 ? notesRaw : null;

  const { error } = await supabase.from("household_groceries").insert({
    household_id: householdId,
    name,
    quantity,
    category,
    priority,
    assigned_to: assignedTo,
    notes,
    created_by: user.id,
  });

  if (error?.message) {
    console.error("[groceries] create", error.message);
    return {
      error: shouldExposeSupabaseError() ? error.message : PUBLIC_TRY_AGAIN,
    };
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/household/${householdId}`);
  revalidatePath("/dashboard");
  return { ok: true };
}

export async function toggleGroceryBought(formData: FormData): Promise<void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const groceryId = String(formData.get("grocery_id") ?? "").trim();
  const nextBought = String(formData.get("next_bought") ?? "") === "1";
  if (!householdId || !groceryId) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { error } = await supabase
    .from("household_groceries")
    .update({
      bought: nextBought,
      bought_at: nextBought ? new Date().toISOString() : null,
      bought_by: nextBought ? user.id : null,
    })
    .eq("id", groceryId)
    .eq("household_id", householdId);

  if (error?.message) {
    console.error("[groceries] toggle", error.message);
    return;
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/household/${householdId}`);
  revalidatePath("/dashboard");
}
