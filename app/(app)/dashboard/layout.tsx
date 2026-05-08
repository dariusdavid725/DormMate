import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { households, error } = await loadHouseholdSummaries(user.id);
  const { data: adminFlag } = await supabase.rpc("is_platform_super_admin");
  const showAdmin = adminFlag === true;
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, avatar_url")
    .eq("id", user.id)
    .maybeSingle();
  const profileRow = (profile ?? {}) as {
    display_name?: string | null;
    avatar_url?: string | null;
  };

  return (
    <DashboardShell
      email={user.email ?? ""}
      displayName={profileRow.display_name ?? null}
      avatarUrl={profileRow.avatar_url ?? null}
      showAdmin={showAdmin}
      households={households}
      listError={error}
    >
      {children}
    </DashboardShell>
  );
}
