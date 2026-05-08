import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { GettingStartedHint } from "@/components/dashboard/getting-started-hint";
import { MobileDashboardHome } from "@/components/mobile/mobile-dashboard-home";
import { DashboardActivityPanel } from "@/components/dashboard/dashboard-activity-panel";
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
  const roommateCount = roommateMembers.length;
  const openGroceries = (groceryPreview.items ?? []).filter((g) => !g.bought);
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
        <div className="mx-auto w-full max-w-[1240px] pb-12">
          <div className="dm-dashboard-grid">
            <header className="dm-hero-module dm-module-depth dm-card-enter col-span-12 px-6 pb-6 pt-5 lg:col-span-8">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="dm-chip dm-chip-accent">Koti board</span>
                    <span className="dm-chip">live now</span>
                  </div>
                  <h1 className="mt-3 text-[2rem] font-semibold leading-tight tracking-tight text-dm-text sm:text-[2.55rem]">
                    {spotlightHome ? `${spotlightHome.name} today` : "Your shared home hub"}
                  </h1>
                  <p className="mt-2 max-w-2xl text-[14px] leading-relaxed text-dm-muted">
                    {hasHouseholds
                      ? "A living snapshot of chores, groceries, money, and updates."
                      : "Create your first home to unlock chores, groceries, money, receipts, and events."}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <span className="dm-chip">{spotlightOpenTasks.length} chores</span>
                  <span className="dm-chip">{openGroceries.length} groceries pending</span>
                  <span className="dm-chip">{receiptsLast7d} receipts / 7d</span>
                  <span className="dm-chip">{roommateCount} roommates</span>
                </div>
              </div>
            </header>

            <section className="dm-module dm-module-depth dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-4" style={{ animationDelay: "40ms" }}>
              <div className="flex items-center justify-between">
                <h2 className="dm-section-heading">Needs attention</h2>
                <Link href={spotlightHome ? `/dashboard/household/${spotlightHome.id}?view=members` : "/dashboard/more"} className="text-[12px] font-semibold text-dm-electric hover:underline">
                  View home
                </Link>
              </div>
              <div className="mt-3 space-y-2">
                <div className="rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/45 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-dm-muted">Next important</p>
                  <p className="mt-1 line-clamp-2 text-sm font-semibold text-dm-text">
                    {nextTask ? nextTask.title : "No urgent chores right now."}
                  </p>
                </div>
                <div className="rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/45 px-3.5 py-3">
                  <p className="text-[11px] uppercase tracking-wide text-dm-muted">Money pulse</p>
                  <p className="mt-1 text-sm font-semibold text-dm-text">{owedPreview}</p>
                </div>
              </div>
            </section>
          </div>

          {error ? (
            <div
              role="alert"
              className="mt-6 rounded-md border border-dm-danger/40 bg-dm-surface px-4 py-3 text-sm text-dm-danger"
            >
              {shouldExposeSupabaseError() ? error : PUBLIC_TRY_AGAIN}
            </div>
          ) : null}

          <div className="dm-dashboard-grid mt-6">
            <section className="dm-module dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-3" style={{ animationDelay: "80ms" }}>
              <h2 className="dm-section-heading">Quick actions</h2>
              <div className="mt-3">
                <DashboardQuickActions />
              </div>
            </section>

            <section className="dm-module dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-5" style={{ animationDelay: "110ms" }}>
              <h2 className="dm-section-heading">Today status</h2>
              <div className="mt-3">
                <TodayStrip
                  choresDue={openTasks.length}
                  owedLabel={owedPreview}
                  receiptsRecent={receiptsLast7d}
                  groceriesLabel={groceriesLabel}
                  hasHouseholds={hasHouseholds}
                />
              </div>
            </section>

            <section className="dm-module dm-module-muted dm-module-depth dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-4" style={{ animationDelay: "140ms" }}>
              <div className="flex items-center justify-between">
                <h2 className="dm-section-heading">Roommates</h2>
                <Link href={spotlightHome ? `/dashboard/household/${spotlightHome.id}?view=members` : "/dashboard/more"} className="text-[12px] font-semibold text-dm-electric hover:underline">
                  View members
                </Link>
              </div>
              <div className="mt-3 rounded-xl border border-[var(--dm-border)] bg-dm-surface px-3.5 py-3">
                <div className="dm-avatar-stack">
                  {roommateMembers.slice(0, 5).map((member) =>
                    member.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element -- user avatars from Supabase storage
                      <img
                        key={member.userId}
                        src={member.avatarUrl}
                        alt={member.displayName ?? "roommate"}
                        className="h-8 w-8 rounded-full border border-[var(--dm-border-strong)] object-cover bg-dm-surface"
                      />
                    ) : (
                      <span key={member.userId} className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[var(--dm-border-strong)] bg-dm-surface text-[10px] font-semibold uppercase text-dm-text">
                        {(member.displayName?.trim() || member.email?.trim() || "R").slice(0, 1)}
                      </span>
                    ),
                  )}
                </div>
                <p className="mt-2 text-sm font-semibold text-dm-text">{roommateCount} active</p>
                <p className="mt-0.5 text-[12px] text-dm-muted">
                  {spotlightHome ? `In ${spotlightHome.name}` : "Open a home to see members"}
                </p>
              </div>
            </section>

            <section className="dm-module dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-4" style={{ animationDelay: "170ms" }}>
              <div className="flex items-center justify-between">
                <h2 className="dm-section-heading">Groceries</h2>
                <Link href="/dashboard/inventory" className="text-[12px] font-semibold text-dm-electric hover:underline">View groceries</Link>
              </div>
              <p className="mt-3 text-[13px] text-dm-muted">{openGroceries.length} pending items</p>
              <ul className="mt-2 space-y-1.5">
                {openGroceries.slice(0, 3).map((item) => (
                  <li key={item.id} className="rounded-lg border border-[var(--dm-border)] bg-dm-surface-mid/40 px-2.5 py-1.5 text-sm text-dm-text">
                    <span className="block truncate">{item.name}</span>
                  </li>
                ))}
                {openGroceries.length === 0 ? <li className="text-[12px] text-dm-muted">Nothing pending.</li> : null}
              </ul>
            </section>

            <section className="dm-module dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-4" style={{ animationDelay: "200ms" }}>
              <div className="flex items-center justify-between">
                <h2 className="dm-section-heading">Money</h2>
                <Link href="/dashboard/finances" className="text-[12px] font-semibold text-dm-electric hover:underline">View money</Link>
              </div>
              <p className="mt-3 text-sm font-semibold text-dm-text">{owedPreview}</p>
              <p className="mt-1 text-[12px] text-dm-muted">
                {expensePreview.expenses.filter((e) => e.status === "pending").length} open bills
              </p>
              {latestExpense ? (
                <div className="mt-2 rounded-lg border border-[var(--dm-border)] bg-dm-surface-mid/40 px-2.5 py-2">
                  <p className="truncate text-sm font-semibold text-dm-text">{latestExpense.title}</p>
                  <p className="text-[12px] text-dm-muted">
                    {formatMoneySafe(latestExpense.amount, latestExpense.currency)}
                  </p>
                </div>
              ) : null}
            </section>

            <section className="dm-module dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-4" style={{ animationDelay: "230ms" }}>
              <div className="flex items-center justify-between">
                <h2 className="dm-section-heading">Chores</h2>
                <Link href="/dashboard/tasks" className="text-[12px] font-semibold text-dm-electric hover:underline">View chores</Link>
              </div>
              <p className="mt-3 text-sm font-semibold text-dm-text">{spotlightOpenTasks.length} open in this home</p>
              <p className="mt-1 text-[12px] text-dm-muted">
                {nextTask ? `Next: ${nextTask.title}` : "All clear for now."}
              </p>
            </section>

            {activityErr ? (
              <p className="col-span-12 mb-2 text-[12px] text-dm-danger">Showing partial activity.</p>
            ) : null}
            <DashboardActivityPanel items={houseActivity} className="dm-module-depth dm-card-enter col-span-12 lg:col-span-8" />

            <section className="dm-module dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-4" style={{ animationDelay: "280ms" }}>
              <div className="flex items-center justify-between">
                <h2 className="dm-section-heading">Upcoming</h2>
                <Link href={spotlightHome ? `/dashboard/household/${spotlightHome.id}?view=events` : "/dashboard/more"} className="text-[12px] font-semibold text-dm-electric hover:underline">
                  View events
                </Link>
              </div>
              <ul className="mt-3 space-y-2">
                {upcomingEvents.map((ev) => (
                  <li key={ev.id} className="rounded-lg border border-[var(--dm-border)] bg-dm-surface-mid/40 px-2.5 py-2">
                    <p className="text-sm font-semibold text-dm-text">{ev.title}</p>
                    <p className="text-[12px] text-dm-muted">
                      {new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(ev.startsAt))}
                    </p>
                  </li>
                ))}
                {upcomingEvents.length === 0 ? (
                  <li className="text-[12px] text-dm-muted">No upcoming events.</li>
                ) : null}
              </ul>
            </section>
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
          <div className="mt-5">
            <GettingStartedHint hasHouseholds={hasHouseholds} />
          </div>
        </div>
      </div>
    </>
  );
}
