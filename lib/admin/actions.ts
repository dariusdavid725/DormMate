"use server";

import { revalidatePath } from "next/cache";

import { createClient } from "@/lib/supabase/server";

export async function addPlatformAdminEmail(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("set_platform_admin_email", {
    p_email: email,
  });
  if (error?.message) {
    console.error("[admin] addPlatformAdminEmail", error.message);
    return;
  }

  revalidatePath("/dashboard/admin");
}

export async function removePlatformAdminEmail(formData: FormData): Promise<void> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  if (!email) return;

  const supabase = await createClient();
  const { error } = await supabase.rpc("remove_platform_admin_email", {
    p_email: email,
  });
  if (error?.message) {
    console.error("[admin] removePlatformAdminEmail", error.message);
    return;
  }

  revalidatePath("/dashboard/admin");
}

