import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileScrollViewport } from "@/components/mobile/mobile-scroll-viewport";
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
    <div className="mx-auto flex min-h-0 w-full max-w-4xl flex-1 flex-col overflow-hidden lg:block lg:flex-none lg:space-y-5 lg:overflow-visible">
      <header className="shrink-0 border-b border-[var(--dm-border-strong)] pb-4 pt-1 lg:pb-5 lg:pt-0">
        <h1 className="text-[1.35rem] font-bold leading-tight tracking-tight text-dm-text lg:text-[1.9rem] lg:font-semibold">
          Activity
        </h1>
        <p className="mt-0.5 line-clamp-2 text-[11px] text-dm-muted lg:mt-1 lg:block lg:text-[13px] lg:leading-snug lg:line-clamp-none">
          Full timeline across chores, money, receipts, groceries, and events.
        </p>
      </header>

      <MobileScrollViewport className="flex flex-col gap-4 px-px pb-4 pt-2 lg:flex-none lg:contents lg:gap-0 lg:p-0">
        <DashboardActivityPanel items={items} showSeeMore={false} />

        <Link
          href="/dashboard"
          className="hidden text-sm font-semibold text-dm-electric hover:underline lg:inline-flex lg:touch-auto lg:underline"
        >
          ← Back to dashboard
        </Link>
      </MobileScrollViewport>
    </div>
  );
}
