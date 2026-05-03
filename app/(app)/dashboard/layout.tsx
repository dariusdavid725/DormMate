import { redirect } from "next/navigation";

import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { isPlatformSuperAdmin } from "@/lib/platform-admin";
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

  return (
    <DashboardShell
      email={user.email ?? ""}
      showAdmin={isPlatformSuperAdmin(user.email)}
      households={households}
      listError={error}
    >
      {children}
    </DashboardShell>
  );
}
