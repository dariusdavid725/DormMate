"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { createClient } from "@/lib/supabase/server";

export type HouseholdActionState = {
  error?: string;
};

export async function createHousehold(
  _prev: HouseholdActionState | void,
  formData: FormData,
): Promise<HouseholdActionState | void> {
  const name = String(formData.get("name") ?? "").trim();
  if (name.length === 0) {
    return { error: "Enter a household name." };
  }
  if (name.length > 120) {
    return { error: "Name is too long (max 120 characters)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not signed in." };
  }

  const { data: row, error: insH } = await supabase
    .from("households")
    .insert({ name, created_by: user.id })
    .select("id")
    .single();

  if (insH || !row) {
    if (insH?.message) {
      console.error("[createHousehold] households insert", insH.message);
    }
    if (!shouldExposeSupabaseError()) {
      return { error: PUBLIC_TRY_AGAIN };
    }
    return {
      error: insH?.message ?? "Could not create household.",
    };
  }

  const { error: insM } = await supabase.from("household_members").insert({
    household_id: row.id,
    user_id: user.id,
    role: "owner",
  });

  if (insM) {
    console.error("[createHousehold] household_members insert", insM.message);
    await supabase.from("households").delete().eq("id", row.id);
    return {
      error: shouldExposeSupabaseError()
        ? insM.message
        : PUBLIC_TRY_AGAIN,
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
