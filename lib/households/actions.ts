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

  const dest = `/dashboard/household/${householdId}`;
  revalidatePath("/dashboard");
  revalidatePath(dest);
  redirect(dest);
}

export type RenameHouseholdState = {
  error?: string;
};

export async function updateHouseholdName(
  _prev: RenameHouseholdState | void,
  formData: FormData,
): Promise<RenameHouseholdState | void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!householdId) {
    return { error: "Missing household." };
  }
  if (name.length === 0) {
    return { error: "Enter a name." };
  }
  if (name.length > 120) {
    return { error: "Name is too long (max 120 characters)." };
  }

  const supabase = await createClient();

  const { error: refreshError } = await supabase.auth.refreshSession();

  if (refreshError) {
    console.error("[updateHouseholdName] refreshSession", refreshError.message);
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session?.access_token || !session.user?.id) {
    console.error("[updateHouseholdName] missing session JWT");
    return {
      error: shouldExposeSupabaseError()
        ? "No valid session JWT. Try signing out and in again."
        : PUBLIC_TRY_AGAIN,
    };
  }

  const { error: updErr } = await supabase
    .from("households")
    .update({ name })
    .eq("id", householdId);

  if (updErr?.message) {
    console.error("[updateHouseholdName] update", updErr.message);
    if (!shouldExposeSupabaseError()) {
      return { error: PUBLIC_TRY_AGAIN };
    }
    return { error: updErr.message };
  }

  const detailPath = `/dashboard/household/${householdId}`;
  revalidatePath("/dashboard");
  revalidatePath(detailPath);
  redirect(detailPath);
}

export type InviteActionState = { error?: string; ok?: boolean; code?: string };

export async function joinHouseholdByInviteCode(
  _prev: InviteActionState | void,
  formData: FormData,
): Promise<InviteActionState | void> {
  const code = String(formData.get("code") ?? "").trim();
  if (code.length < 4) {
    return { error: "Paste a valid invite code." };
  }

  const supabase = await createClient();
  const { data: hid, error: rpcErr } = await supabase.rpc(
    "join_household_by_invite_code",
    { p_code: code },
  );

  if (rpcErr?.message || !hid) {
    if (!shouldExposeSupabaseError()) {
      return { error: PUBLIC_TRY_AGAIN };
    }
    return { error: rpcErr?.message ?? "Could not join." };
  }

  const hh = String(hid);
  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/household/${hh}`);
  redirect(`/dashboard/household/${hh}`);
}

export async function regenerateInviteFormAction(
  _prev: InviteActionState | void,
  formData: FormData,
): Promise<InviteActionState> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  return regenerateHouseholdInviteCode(householdId);
}

export async function regenerateHouseholdInviteCode(
  householdId: string,
): Promise<InviteActionState> {
  if (!householdId) {
    return { error: "Missing household." };
  }

  const supabase = await createClient();

  const { data: code, error: rpcErr } = await supabase.rpc(
    "regenerate_household_invite_code",
    { p_household_id: householdId },
  );

  if (rpcErr?.message) {
    if (!shouldExposeSupabaseError()) {
      return { error: PUBLIC_TRY_AGAIN };
    }
    return { error: rpcErr.message };
  }

  if (typeof code !== "string") {
    return { error: "Could not regenerate code." };
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/household/${householdId}?view=members`);

  return { ok: true, code };
}

export async function removeHouseholdMember(formData: FormData): Promise<void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const targetUserId = String(formData.get("target_user_id") ?? "").trim();
  if (!householdId || !targetUserId) return;

  const supabase = await createClient();

  const { error: rpcErr } = await supabase.rpc("remove_household_member", {
    p_household_id: householdId,
    p_target_user_id: targetUserId,
  });

  if (rpcErr?.message) {
    console.error("[removeHouseholdMember]", rpcErr.message);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/household/${householdId}`);
}

export async function promoteHouseholdMemberToAdmin(formData: FormData): Promise<void> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const targetUserId = String(formData.get("target_user_id") ?? "").trim();
  if (!householdId || !targetUserId) return;

  const supabase = await createClient();

  const { error: rpcErr } = await supabase.rpc(
    "promote_household_member_to_admin",
    {
      p_household_id: householdId,
      p_target_user_id: targetUserId,
    },
  );

  if (rpcErr?.message) {
    console.error("[promoteHouseholdMemberToAdmin]", rpcErr.message);
    return;
  }

  revalidatePath("/dashboard");
  revalidatePath(`/dashboard/household/${householdId}`);
}
