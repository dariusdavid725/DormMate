"use server";

import { revalidatePath } from "next/cache";

import {
  shouldExposeSupabaseError,
  PUBLIC_TRY_AGAIN,
} from "@/lib/errors/public";
import {
  AVATAR_MAX_BYTES,
  contentTypeForUpload,
  extForMime,
  resolveAvatarMime,
} from "@/lib/profiles/avatar-mime";
import { createClient } from "@/lib/supabase/server";

function shortNameFromEmail(email: string | undefined | null) {
  if (!email) return "Member";
  const local = email.split("@")[0]?.trim();
  return local || "Member";
}

async function logProfileUpdatedActivity(
  userId: string,
  payload: Record<string, unknown>,
): Promise<void> {
  const supabase = await createClient();
  const { error } = await supabase.rpc("log_profile_updated_activity", {
    p_user_id: userId,
    p_payload: payload,
  });
  if (error?.message) {
    console.error("[profiles] activity log", error.message);
  }
}

export async function updateProfileDisplayName(
  formData: FormData,
): Promise<void> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "");
  if (!displayName || displayName.length > 80) {
    console.warn("[profiles] invalid display name");
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error) {
    console.error("[profiles] update display name", error.message);
    return;
  }

  if (householdId) {
    revalidatePath(`/dashboard/household/${householdId}`);
  }
  revalidatePath("/dashboard");
  await logProfileUpdatedActivity(user.id, {
    source: "household_members",
    display_name: displayName,
  });
}

export type AvatarUploadState = {
  ok?: boolean;
  error?: string;
};

function friendlyAvatarStorageError(raw: string | undefined): string {
  const msg = (raw ?? "").trim();
  const low = msg.toLowerCase();
  if (/bucket|bucket not found|does not exist|object not found/.test(low)) {
    return "Avatar storage is not configured yet. Run the latest schema.sql migration in Supabase.";
  }
  if (
    /payload too large|entity too large|413|maximum|file size|size limit/i.test(
      msg,
    )
  ) {
    return "Couldn't upload avatar. Please try a smaller image.";
  }
  if (/mime|invalid|unsupported|not an allowed|wrong type/i.test(low)) {
    return "This file type is not supported.";
  }
  return "Couldn't upload avatar. Please try again.";
}

export async function uploadProfileAvatar(
  _prev: AvatarUploadState | void,
  formData: FormData,
): Promise<AvatarUploadState> {
  const householdId = String(formData.get("household_id") ?? "");

  try {
    const candidates = formData
      .getAll("avatar")
      .filter((x): x is File => x instanceof File);
    const file = candidates.find((f) => f.size > 0) ?? null;
    if (!file || file.size === 0) {
      console.warn("[profiles] avatar: no file in form data");
      return { error: "No image selected." };
    }

    if (file.size > AVATAR_MAX_BYTES) {
      return {
        error: "This image is too large. Maximum size is 5MB.",
      };
    }

    const mime = await resolveAvatarMime(file);
    if (!mime) {
      console.error("[profiles] avatar: rejected mime after sniff", file.type);
      return { error: "This file type is not supported." };
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return { error: "Not signed in." };
    }

    const safeExt = extForMime(mime);
    const path = `${user.id}/avatar-${Date.now()}.${safeExt}`;

    const { error: uploadErr } = await supabase.storage
      .from("avatars")
      .upload(path, file, {
        upsert: false,
        contentType: contentTypeForUpload(mime),
      });

    if (uploadErr?.message) {
      console.error(
        "[profiles] storage upload",
        uploadErr.message,
        uploadErr,
      );
      return { error: friendlyAvatarStorageError(uploadErr.message) };
    }

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(path);

    const { data: existing } = await supabase
      .from("profiles")
      .select("display_name, avatar_url")
      .eq("id", user.id)
      .maybeSingle();

    const previousAvatar =
      (existing as { avatar_url: string | null } | null)?.avatar_url ?? null;

    const { error: dbErr } = await supabase.from("profiles").upsert(
      {
        id: user.id,
        display_name:
          (existing as { display_name: string | null } | null)?.display_name ??
          shortNameFromEmail(user.email),
        avatar_url: publicUrl,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "id" },
    );

    if (dbErr?.message) {
      console.error("[profiles] upsert avatar_url", dbErr.message, dbErr);
      void supabase.storage.from("avatars").remove([path]).catch(() => {});
      return {
        error: "Couldn't upload avatar. Please try again.",
      };
    }

    void supabase.storage
      .from("avatars")
      .remove(previousAvatarParts(previousAvatar))
      .catch((e: unknown) => {
        console.error("[profiles] cleanup old avatar", e);
      });

    if (householdId) {
      revalidatePath(`/dashboard/household/${householdId}`);
    }
    revalidatePath("/dashboard");
    revalidatePath("/dashboard/settings");
    try {
      await logProfileUpdatedActivity(user.id, {
        source: "avatar_upload",
        avatar_changed: true,
      });
    } catch (e: unknown) {
      console.error("[profiles] avatar activity log failed", e);
    }
    return { ok: true };
  } catch (e: unknown) {
    console.error("[profiles] avatar upload unexpected", e);
    return {
      error: "Couldn't upload avatar. Please try again.",
    };
  }
}

function previousAvatarParts(
  avatarUrl: string | null | undefined,
): string[] {
  if (!avatarUrl?.trim()) return [];
  try {
    const marker = "/object/public/avatars/";
    const i = avatarUrl.indexOf(marker);
    let objectPath = "";
    if (i >= 0) {
      objectPath = decodeURIComponent(
        avatarUrl.slice(i + marker.length).split("?")[0]?.trim() ?? "",
      );
    } else if (avatarUrl.includes("/avatars/")) {
      const tail = avatarUrl.split("/avatars/")[1]?.split("?")[0];
      objectPath =
        typeof tail === "string" ?
          decodeURIComponent(tail.trim())
        : "";
    }
    return objectPath ? [objectPath] : [];
  } catch {
    return [];
  }
}

export type ProfileDetailsState = {
  error?: string;
  ok?: boolean;
};

const ALLOWED_DIETARY = new Set([
  "vegan",
  "vegetarian",
  "pescatarian",
  "halal",
  "kosher",
  "lactose_free",
  "gluten_free",
  "nut_allergy",
  "none",
]);

export async function updateProfileDetails(
  _prev: ProfileDetailsState | void,
  formData: FormData,
): Promise<ProfileDetailsState> {
  const displayName = String(formData.get("display_name") ?? "").trim();
  const pronouns = String(formData.get("pronouns") ?? "").trim();
  const genderIdentity = String(formData.get("gender_identity") ?? "").trim();
  const bio = String(formData.get("bio") ?? "").trim();

  const dietaryRaw = formData
    .getAll("dietary_preferences")
    .map((x) => String(x).trim())
    .filter(Boolean);
  const dietary = [...new Set(dietaryRaw)].filter((x) =>
    ALLOWED_DIETARY.has(x),
  );

  if (displayName.length > 80) {
    return { error: "Display name too long (max 80)." };
  }
  if (pronouns.length > 40) {
    return { error: "Pronouns too long (max 40)." };
  }
  if (genderIdentity.length > 40) {
    return { error: "Gender field too long (max 40)." };
  }
  if (bio.length > 300) {
    return { error: "Bio too long (max 300)." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { error: "Not signed in." };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      display_name: displayName || shortNameFromEmail(user.email),
      pronouns: pronouns || null,
      gender_identity: genderIdentity || null,
      dietary_preferences: dietary,
      bio: bio || null,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "id" },
  );

  if (error?.message) {
    console.error("[profiles] update details", error.message);
    return {
      error: shouldExposeSupabaseError() ? error.message : PUBLIC_TRY_AGAIN,
    };
  }

  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
  await logProfileUpdatedActivity(user.id, {
    source: "settings",
    display_name: displayName || shortNameFromEmail(user.email),
    pronouns: pronouns || null,
    gender_identity: genderIdentity || null,
  });
  return { ok: true };
}
