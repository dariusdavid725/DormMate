import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { GettingStartedHint } from "@/components/dashboard/getting-started-hint";
import { MobileDashboardHome } from "@/components/mobile/mobile-dashboard-home";
import { DashboardActivityPanel } from "@/components/dashboard/dashboard-activity-panel";
import { DashboardHomeDesktop } from "@/components/dashboard/dashboard-home-desktop";
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
import { loadHouseholdExpenses } from "@/lib/expenses/queries";
import { formatMoneySafe } from "@/lib/currency/format-money";
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
  const [memberPreview, groceryPreview, eventPreview, expensePreview] = spotlightHome
    ? await Promise.all([
        loadHouseholdMembers(spotlightHome.id),
        loadGroceriesForHousehold(spotlightHome.id),
        loadHouseholdEvents(spotlightHome.id),
        loadHouseholdExpenses(spotlightHome.id),
      ])
    : [[], { items: [], error: null }, { events: [], error: null }, { expenses: [], error: null }];
  const roommateMembers = Array.isArray(memberPreview) ? memberPreview : [];
  const openGroceries = (groceryPreview.items ?? []).filter((g) => !g.bought);
  const openBillsSpotlight = expensePreview.expenses.filter((e) => e.status === "pending").length;
  const upcomingEvents = (eventPreview.events ?? [])
    .filter((ev) => new Date(ev.startsAt).getTime() >= Date.now())
    .slice(0, 2);
  const spotlightOpenTasks = spotlightHome
    ? openTasks.filter((task) => task.householdId === spotlightHome.id)
    : [];
  const nextTask = [...spotlightOpenTasks]
    .sort((a, b) => {
      if (!a.dueAt && !b.dueAt) return 0;
      if (!a.dueAt) return 1;
      if (!b.dueAt) return -1;
      return new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime();
    })[0];
  const latestExpense = expensePreview.expenses[0];
  const latestExpensePreview =
    latestExpense ?
      {
        title: latestExpense.title,
        amountFormatted: formatMoneySafe(latestExpense.amount, latestExpense.currency),
      }
    : null;

  return (
    <>
      <div className="max-lg:flex max-lg:h-full max-lg:min-h-0 max-lg:flex-1 max-lg:flex-col max-lg:overflow-hidden lg:contents lg:min-h-0 lg:overflow-visible">
      <MobileDashboardHome
        firstName={firstName}
        householdLine={householdLine}
        spotlightHomeName={spotlightHome?.name ?? null}
        spotlightHouseholdId={spotlightHome?.id ?? null}
        primaryHouseholdId={primaryHouseholdId}
        hasHouseholds={hasHouseholds}
        choresDue={openTasks.length}
        choresOpenSpotlight={spotlightOpenTasks.length}
        owedLabel={owedPreview}
        receiptsRecent={receiptsLast7d}
        openGroceriesCount={openGroceries.length}
        openTasks={openTasks}
        roommates={roommateMembers.map((m) => ({
          userId: m.userId,
          displayName: m.displayName,
          avatarUrl: m.avatarUrl,
          email: m.email,
          role: m.role,
        }))}
        activityPreview={houseActivity}
        activityError={!!activityErr}
        householdsError={error ?? null}
      />
      </div>

      <div className="hidden lg:block">
        {error ?
          <div className="mx-auto mb-6 w-full max-w-[1240px] rounded-md border border-dm-danger/40 bg-dm-surface px-4 py-3 text-sm text-dm-danger">
            <div role="alert">
              {shouldExposeSupabaseError() ? error : PUBLIC_TRY_AGAIN}
            </div>
          </div>
        : null}
        <DashboardHomeDesktop
          firstName={firstName}
          spotlightHome={spotlightHome}
          hasHouseholds={hasHouseholds}
          roommateMembers={roommateMembers}
          choresOpenHome={spotlightOpenTasks.length}
          choresDueTotal={openTasks.length}
          owedLabel={owedPreview}
          receiptsRecent={receiptsLast7d}
          openGroceries={openGroceries}
          openBillsCount={openBillsSpotlight}
          nextTask={nextTask}
          upcomingEvents={upcomingEvents.map((ev) => ({ id: ev.id, title: ev.title, startsAt: ev.startsAt }))}
          latestExpense={latestExpensePreview}
          groceriesLabel={groceriesLabel}
          activityPanel={
            <>
              {activityErr ?
                <p className="mb-2 px-5 pt-5 text-[12px] text-dm-danger">Showing partial activity.</p>
              : null}
              <DashboardActivityPanel
                items={houseActivity}
                embedded
                title="What everyone’s up to"
                className="dm-card-enter"
              />
            </>
          }
        />

        {!hasHouseholds ? (
          <div className="mx-auto w-full max-w-[1240px]">
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
          </div>
        ) : null}
        <div className="mx-auto mt-5 w-full max-w-[1240px]">
          <GettingStartedHint hasHouseholds={hasHouseholds} />
        </div>
      </div>
    </>
  );
}
