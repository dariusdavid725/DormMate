"use server";

import { revalidatePath } from "next/cache";

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
  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    console.warn("[profiles] no avatar file");
    return;
  }
  if (file.size > 2 * 1024 * 1024) {
    console.warn("[profiles] avatar too large");
    return;
  }

  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
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
}
