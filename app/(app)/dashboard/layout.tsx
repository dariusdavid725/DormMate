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

  return (
    <DashboardShell
      email={user.email ?? ""}
      showAdmin={showAdmin}
      households={households}
      listError={error}
    >
      {children}
    </DashboardShell>
  );
}
