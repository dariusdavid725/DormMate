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
import { loadHouseholdMembers, loadHouseholdSummaries } from "@/lib/households/queries";
import { loadGroceriesForHousehold } from "@/lib/groceries/queries";
import { loadReceiptFeedPreview } from "@/lib/receipts/feed-queries";
import { loadOpenTasksForUser } from "@/lib/tasks/queries";
import { loadHouseholdEvents } from "@/lib/events/queries";
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
  const groceriesLabel = hasHouseholds ? "Open" : "—";
  const spotlightHome = households[0] ?? null;
  const [memberPreview, groceryPreview, eventPreview] = spotlightHome
    ? await Promise.all([
        loadHouseholdMembers(spotlightHome.id),
        loadGroceriesForHousehold(spotlightHome.id),
        loadHouseholdEvents(spotlightHome.id),
      ])
    : [[], { items: [], error: null }, { events: [], error: null }];
  const roommateCount = Array.isArray(memberPreview) ? memberPreview.length : 0;
  const openGroceries = (groceryPreview.items ?? []).filter((g) => !g.bought);
  const upcomingEvents = (eventPreview.events ?? [])
    .filter((ev) => new Date(ev.startsAt).getTime() >= Date.now())
    .slice(0, 2);

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
        <div className="mx-auto w-full max-w-4xl pb-12">
          <header className="dm-hero-module px-6 pb-6 pt-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="dm-chip dm-chip-accent">Koti board</div>
                <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-tight text-dm-text sm:text-[2.45rem]">
                  {spotlightHome ? `${spotlightHome.name} at a glance` : "Your shared home hub"}
                </h1>
                <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-dm-muted">
                  {hasHouseholds
                    ? "Today’s chores, money, groceries, and house updates in one clear board."
                    : "Create your first home to unlock chores, groceries, money, receipts, and events."}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="dm-chip">{openTasks.length} chores</span>
                <span className="dm-chip">{receiptsLast7d} receipts / 7d</span>
                <span className="dm-chip">{roommateCount} roommates</span>
              </div>
            </div>
          </header>

          {error ? (
        <div
          role="alert"
          className="mt-6 rounded-md border border-dm-danger/40 bg-dm-surface px-4 py-3 text-sm text-dm-danger"
        >
          {shouldExposeSupabaseError() ? error : PUBLIC_TRY_AGAIN}
        </div>
          ) : null}

          <div className="dm-shell-grid mt-6">
            <div className="space-y-4">
              <TodayStrip
                choresDue={openTasks.length}
                owedLabel={owedPreview}
                receiptsRecent={receiptsLast7d}
                groceriesLabel={groceriesLabel}
                hasHouseholds={hasHouseholds}
              />

              <DashboardQuickActions />

              <section aria-labelledby="activity-heading" className="dm-module p-5">
                <div className="mb-3 flex flex-wrap items-end justify-between gap-x-3 gap-y-2">
                  <h2 id="activity-heading" className="dm-section-heading">
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

            <div className="space-y-4">
              <section className="dm-module dm-module-muted p-4">
                <h2 className="dm-section-heading">Next important item</h2>
                {openTasks[0] ? (
                  <div className="mt-3 rounded-xl border border-[var(--dm-border)] bg-dm-surface px-3.5 py-3">
                    <p className="text-sm font-semibold text-dm-text">{openTasks[0].title}</p>
                    <p className="mt-1 text-[12px] text-dm-muted">
                      {openTasks[0].householdName} · +{openTasks[0].rewardPoints} pts
                    </p>
                    <Link
                      href="/dashboard/tasks"
                      className="mt-2 inline-flex text-[12px] font-semibold text-dm-electric hover:underline"
                    >
                      Open chores
                    </Link>
                  </div>
                ) : (
                  <p className="mt-3 text-[13px] text-dm-muted">No urgent chores right now.</p>
                )}
              </section>

              <section className="dm-module p-4">
                <h2 className="dm-section-heading">Home previews</h2>
                <div className="mt-3 space-y-2.5">
                  <div className="rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/50 px-3 py-2.5">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-dm-muted">
                      Roommates
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dm-text">
                      {roommateCount} active in {spotlightHome?.name ?? "your home"}
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/50 px-3 py-2.5">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-dm-muted">
                      Groceries
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dm-text">
                      {openGroceries.length} items pending
                    </p>
                  </div>
                  <div className="rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/50 px-3 py-2.5">
                    <p className="text-[12px] font-semibold uppercase tracking-wide text-dm-muted">
                      Events
                    </p>
                    <p className="mt-1 text-sm font-semibold text-dm-text">
                      {upcomingEvents.length ? `${upcomingEvents.length} upcoming` : "No upcoming events"}
                    </p>
                  </div>
                </div>
              </section>

              <GettingStartedHint hasHouseholds={hasHouseholds} />
            </div>
          </div>

          {!hasHouseholds ? (
            <section
              id="create-household"
              className="dm-card-surface mt-10 scroll-mt-24 p-5 sm:p-6"
              aria-labelledby="hh-new"
            >
              <div className="mb-3 flex items-center gap-2">
                <span className="text-2xl font-semibold tracking-tight text-dm-text">Create home</span>
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
