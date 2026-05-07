"use server";

import { revalidatePath } from "next/cache";

import {
  shouldExposeSupabaseError,
  PUBLIC_TRY_AGAIN,
} from "@/lib/errors/public";
import { createClient } from "@/lib/supabase/server";

function shortNameFromEmail(email: string | undefined | null) {
  if (!email) return "Member";
  const local = email.split("@")[0]?.trim();
  return local || "Member";
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
}

export async function uploadProfileAvatar(formData: FormData): Promise<void> {
  const householdId = String(formData.get("household_id") ?? "");
  const candidates = formData
    .getAll("avatar")
    .filter((x): x is File => x instanceof File);
  const file = candidates.find((f) => f.size > 0) ?? null;
  if (!file || file.size === 0) {
    console.warn("[profiles] no avatar file");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    console.warn("[profiles] avatar too large");
    return;
  }

  const allowed = [
    "image/jpeg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/heic",
    "image/heif",
  ];
  if (!allowed.includes(file.type)) {
    console.warn("[profiles] invalid avatar type");
    return;
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return;
  }

  const ext =
    file.type === "image/png"
      ? "png"
      : file.type === "image/webp"
        ? "webp"
        : file.type === "image/gif"
          ? "gif"
          : file.type === "image/heic"
            ? "heic"
            : file.type === "image/heif"
              ? "heif"
          : "jpg";
  const path = `${user.id}/avatar.${ext}`;

  const { error: uploadErr } = await supabase.storage
    .from("avatars")
    .upload(path, file, {
      upsert: true,
      contentType: file.type,
    });

  if (uploadErr) {
    console.error("[profiles] storage upload", uploadErr.message);
    return;
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { data: existing } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

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

  if (dbErr) {
    console.error("[profiles] upsert avatar url", dbErr.message);
    return;
  }

  if (householdId) {
    revalidatePath(`/dashboard/household/${householdId}`);
  }
  revalidatePath("/dashboard");
  revalidatePath("/dashboard/settings");
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
  return { ok: true };
}
