import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { DashboardActivityPanel } from "@/components/dashboard/dashboard-activity-panel";
import { loadHouseActivityItems } from "@/lib/dashboard/house-activity";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Activity",
};

export default async function DashboardActivityPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/activity");
  }

  const { households } = await loadHouseholdSummaries(user.id);
  const { items } = await loadHouseActivityItems(households, 120);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-5">
      <header className="border-b border-[var(--dm-border-strong)] pb-5">
        <h1 className="text-[1.9rem] font-semibold tracking-tight text-dm-text">All home activity</h1>
        <p className="mt-1 text-[13px] text-dm-muted">
          Full timeline across chores, money, receipts, groceries, and events.
        </p>
      </header>

      <DashboardActivityPanel items={items} showSeeMore={false} />

      <Link href="/dashboard" className="inline-flex text-sm font-semibold text-dm-electric hover:underline">
        ← Back to dashboard
      </Link>
    </div>
  );
}
