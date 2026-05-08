import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { GettingStartedHint } from "@/components/dashboard/getting-started-hint";
import { MobileDashboardHome } from "@/components/mobile/mobile-dashboard-home";
import { HouseActivityFeed } from "@/components/dashboard/house-activity-feed";
import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
import { TodayStrip } from "@/components/dashboard/today-strip";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadUserCrossHouseholdNetLabel } from "@/lib/dashboard/budget-preview";
import { loadHouseActivityItems } from "@/lib/dashboard/house-activity";
import { countReceiptsSince } from "@/lib/dashboard/home-metrics";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { loadReceiptFeedPreview } from "@/lib/receipts/feed-queries";
import { loadOpenTasksForUser } from "@/lib/tasks/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
};

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { households, error } = await loadHouseholdSummaries(user.id);
  const { tasks: openTasks } = await loadOpenTasksForUser(user.id);
  const { items: receiptFeed } = await loadReceiptFeedPreview(households);

  const receiptsLast7d = countReceiptsSince(receiptFeed, 7);

  const { items: houseActivity, error: activityErr } =
    await loadHouseActivityItems(households, 10);

  const { label: owedPreview } = await loadUserCrossHouseholdNetLabel(
    user.id,
    households,
  );

  const firstName =
    user.email?.split("@")[0]?.replace(/[._-]/g, " ").trim() ?? "";
  const householdLine =
    households.length === 0 ?
      "Set up a home to unlock chores and splits."
    : households.length === 1 ?
      households[0]!.name
    : `${households.length} homes · switch from the top bar`;
  const primaryHouseholdId = households[0]?.id ?? null;
  const hasHouseholds = households.length > 0;

  return (
    <>
      <MobileDashboardHome
        firstName={firstName}
        householdLine={householdLine}
        primaryHouseholdId={primaryHouseholdId}
        hasHouseholds={hasHouseholds}
        choresDue={openTasks.length}
        owedLabel={owedPreview}
        receiptsRecent={receiptsLast7d}
        openTasks={openTasks}
        activityPreview={houseActivity}
        activityError={!!activityErr}
        householdsError={error ?? null}
      />

      <div className="hidden lg:block">
        <div className="cozy-board mx-auto w-full max-w-lg pb-12 lg:max-w-3xl">
          <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-5">
        <h1 className="font-cozy-display text-[2.65rem] leading-none text-dm-text sm:text-5xl">
          The Koti board
        </h1>
        {!hasHouseholds ? (
          <p className="mt-2 text-[13px] text-dm-muted">
            Tape up a household first — then tasks and slips can stick here.
          </p>
        ) : (
          <p className="mt-2 text-[13px] text-dm-muted">
            Your shared wall for today, chores, and what just happened.
          </p>
        )}
          </header>

          {error ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-dm-danger/40 bg-dm-surface px-4 py-3 text-sm text-dm-danger"
        >
          {shouldExposeSupabaseError() ? error : PUBLIC_TRY_AGAIN}
        </div>
          ) : null}

          <div className="mt-8 space-y-10 rounded-xl border border-[rgba(107,96,84,0.15)] bg-dm-surface-mid/40 p-5 shadow-inner sm:p-6">
            <TodayStrip
          choresDue={openTasks.length}
          owedLabel={owedPreview}
          receiptsRecent={receiptsLast7d}
          hasHouseholds={hasHouseholds}
            />

            <GettingStartedHint hasHouseholds={hasHouseholds} />

            <DashboardQuickActions />

            <section aria-labelledby="activity-heading">
              <div className="mb-3 flex flex-wrap items-end gap-x-3 gap-y-2">
                <h2 id="activity-heading" className="font-cozy-display text-2xl text-dm-text">
                  House activity
                </h2>
                <div className="flex gap-3 text-[12px] font-semibold text-dm-electric">
                  <Link href="/dashboard/tasks" className="hover:underline">
                    Chores
                  </Link>
                  <Link href="/dashboard/finances" className="hover:underline">
                    Money
                  </Link>
                </div>
              </div>
              {activityErr ? (
                <p className="mb-2 text-[12px] text-dm-danger">Showing partial activity.</p>
              ) : null}
              <HouseActivityFeed items={houseActivity} />
            </section>
          </div>

          {!hasHouseholds ? (
            <section
              id="create-household"
              className="cozy-poster cozy-tilt-xs mt-10 scroll-mt-24 border-dashed border-dm-muted/35 p-5 sm:p-6"
              aria-labelledby="hh-new"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="font-cozy-display text-3xl text-dm-text">Create household</span>
                <span className="cozy-pin shrink-0" aria-hidden />
              </div>
              <p className="text-[13px] text-dm-muted">
                Enter a name for your dorm or flat. You can join more homes later from the menu.
              </p>
              <CreateHouseholdForm className="mt-4 space-y-4" />
            </section>
          ) : null}
        </div>
      </div>
    </>
  );
}
