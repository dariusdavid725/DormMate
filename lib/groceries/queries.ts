import { cache } from "react";

import { createClient } from "@/lib/supabase/server";

export type GroceryRow = {
  id: string;
  householdId: string;
  name: string;
  quantity: string;
  category: string;
  priority: "low" | "medium" | "high";
  assignedTo: string | null;
  notes: string | null;
  bought: boolean;
  createdBy: string;
  createdAt: string;
  boughtAt: string | null;
  boughtBy: string | null;
};

export const loadGroceriesForHousehold = cache(async (householdId: string) => {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("household_groceries")
    .select(
      "id, household_id, name, quantity, category, priority, assigned_to, notes, bought, created_by, created_at, bought_at, bought_by",
    )
    .eq("household_id", householdId)
    .order("bought", { ascending: true })
    .order("priority", { ascending: false })
    .order("created_at", { ascending: false });

  if (error?.message) {
    console.error("[groceries] list", error.message);
    return { error: error.message, items: [] as GroceryRow[] };
  }

  const items = (data ?? []).map((row) => {
    const r = row as {
      id: string;
      household_id: string;
      name: string;
      quantity: string | null;
      category: string | null;
      priority: string | null;
      assigned_to: string | null;
      notes: string | null;
      bought: boolean | null;
      created_by: string;
      created_at: string;
      bought_at: string | null;
      bought_by: string | null;
    };
    return {
      id: r.id,
      householdId: r.household_id,
      name: r.name,
      quantity: r.quantity?.trim() || "1",
      category: r.category?.trim() || "General",
      priority:
        r.priority === "high" || r.priority === "low" ? r.priority : "medium",
      assignedTo: r.assigned_to,
      notes: r.notes,
      bought: r.bought === true,
      createdBy: r.created_by,
      createdAt: r.created_at,
      boughtAt: r.bought_at,
      boughtBy: r.bought_by,
    } satisfies GroceryRow;
  });

  return { error: null as string | null, items };
});
