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

  const { error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError) {
    console.error("[createHousehold] refreshSession", refreshError.message);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token || !session.user?.id) {
    console.error("[createHousehold] missing session or JWT for PostgREST");
    return {
      error: shouldExposeSupabaseError()
        ? "No valid session JWT for database. Try signing out and in again."
        : PUBLIC_TRY_AGAIN,
    };
  }

  const { data: householdId, error: rpcErr } = await supabase.rpc(
    "create_household_as_owner",
    { p_name: name },
  );

  if (rpcErr || !householdId) {
    if (rpcErr?.message) {
      console.error("[createHousehold] rpc create_household_as_owner", rpcErr.message);
    }
    if (!shouldExposeSupabaseError()) {
      return { error: PUBLIC_TRY_AGAIN };
    }
    return {
      error: rpcErr?.message ?? "Could not create household.",
    };
  }

  revalidatePath("/dashboard");
  redirect("/dashboard");
}
