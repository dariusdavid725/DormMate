import type { ReactNode } from "react";
import Link from "next/link";

import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
import { TodayStrip } from "@/components/dashboard/today-strip";

import type { GroceryRow } from "@/lib/groceries/queries";
import type { HouseholdMemberRow } from "@/lib/households/queries";
import type { HouseholdTaskRow } from "@/lib/tasks/queries";

export type SpotlightEvent = {
  id: string;
  title: string;
  startsAt: string;
};

type LatestExpensePreview = {
  title: string;
  amountFormatted: string;
};

type Props = {
  firstName: string;
  spotlightHome: { id: string; name: string } | null;
  hasHouseholds: boolean;
  roommateMembers: HouseholdMemberRow[];
  choresOpenHome: number;
  choresDueTotal: number;
  owedLabel: string;
  receiptsRecent: number;
  openGroceries: GroceryRow[];
  openBillsCount: number;
  nextTask: HouseholdTaskRow | undefined;
  upcomingEvents: SpotlightEvent[];
  latestExpense: LatestExpensePreview | null;
  groceriesLabel: string;
  activityPanel: ReactNode;
};

function fmtDue(dueIso: string | null | undefined) {
  if (!dueIso) return null;
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(dueIso));
  } catch {
    return null;
  }
}

function fmtEventStart(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
  } catch {
    return "";
  }
}

export function DashboardHomeDesktop({
  firstName,
  spotlightHome,
  hasHouseholds,
  roommateMembers,
  choresOpenHome,
  choresDueTotal,
  owedLabel,
  receiptsRecent,
  openGroceries,
  openBillsCount,
  nextTask,
  upcomingEvents,
  latestExpense,
  groceriesLabel,
  activityPanel,
}: Props) {
  const greeting = firstName.trim() ? firstName.trim().split(/\s+/)[0] : "there";
  const householdName = spotlightHome?.name ?? null;
  const openGroceryCount = openGroceries.filter((g) => !g.bought).length;
  const nextEvent = upcomingEvents[0];

  const assigneeName =
    nextTask?.assignedToUserId ?
      roommateMembers.find((m) => m.userId === nextTask.assignedToUserId)?.displayName?.trim() ||
      roommateMembers.find((m) => m.userId === nextTask.assignedToUserId)?.email?.trim() ||
      null
    : null;

  const dueLabel = fmtDue(nextTask?.dueAt);

  let focusKicker = "Household pulse";
  let focusTitle = "You’re caught up.";
  let focusSubtitle = hasHouseholds
    ? "No urgent chores queued in this home. Peek at groceries or money anytime."
    : "Create your first shared home to line up chores, groceries, splits, and events.";
  let focusHref = hasHouseholds ? "/dashboard/tasks" : "/dashboard#create-household";
  let focusLinkLabel = hasHouseholds ? "Browse chores" : "Create a home";

  if (!hasHouseholds) {
    focusKicker = "Get started";
  } else if (nextTask) {
    focusKicker = "Next chore";
    focusTitle = nextTask.title;
    focusSubtitle = [
      dueLabel ? `Due ${dueLabel}` : null,
      assigneeName ? `Assigned · ${assigneeName}` : null,
    ]
      .filter(Boolean)
      .join(" · ") || "Tap through to knock it off the list.";
    focusHref = "/dashboard/tasks";
    focusLinkLabel = "Open chores";
  } else if (openBillsCount > 0) {
    focusKicker = "Money calling";
    focusTitle =
      owedLabel && owedLabel !== "Even" ? owedLabel : `${openBillsCount} pending bill${openBillsCount === 1 ? "" : "s"}`;
    focusSubtitle =
      latestExpense ?
        `Latest: ${latestExpense.title} · ${latestExpense.amountFormatted}`
      : "Balances update as roommates settle up.";
    focusHref = "/dashboard/finances";
    focusLinkLabel = "Review splits";
  } else if (openGroceryCount > 0) {
    focusKicker = "Pantry list";
    focusTitle = `${openGroceryCount} item${openGroceryCount === 1 ? "" : "s"} still on the list`;
    focusSubtitle =
      openGroceries[0] ? `Next up: ${openGroceries[0]!.name}` : "Grab what’s left while you’re out.";
    focusHref = "/dashboard/inventory";
    focusLinkLabel = "Open groceries";
  } else if (nextEvent) {
    focusKicker = "Coming up";
    focusTitle = nextEvent.title;
    focusSubtitle = fmtEventStart(nextEvent.startsAt) || "On the calendar";
    focusHref = spotlightHome ? `/dashboard/household/${spotlightHome.id}?view=events` : "/dashboard/more";
    focusLinkLabel = "View events";
  }

  const also: Array<{ key: string; label: string; href: string; tone?: "warm" | "mint" | "violet" }> = [];

  if (hasHouseholds && nextTask && (openGroceryCount > 0 || openBillsCount > 0 || nextEvent)) {
    if (openBillsCount > 0) {
      also.push({
        key: "money",
        label: owedLabel !== "Even" ? `Money · ${owedLabel}` : `${openBillsCount} bills open`,
        href: "/dashboard/finances",
        tone: "warm",
      });
    }
    if (openGroceryCount > 0) {
      also.push({
        key: "grocery",
        label: `Groceries · ${openGroceryCount}`,
        href: "/dashboard/inventory",
        tone: "mint",
      });
    }
    if (nextEvent) {
      also.push({
        key: "ev",
        label: `Event · ${nextEvent.title}`,
        href: spotlightHome ? `/dashboard/household/${spotlightHome.id}?view=events` : "/dashboard/more",
        tone: "violet",
      });
    }
  } else if (hasHouseholds) {
    if (choresOpenHome > 0 && !nextTask) {
      also.push({
        key: "chor",
        label: `${choresOpenHome} open chore${choresOpenHome === 1 ? "" : "s"} here`,
        href: "/dashboard/tasks",
        tone: "warm",
      });
    }
    also.push({
      key: "rec",
      label: `${receiptsRecent} receipt${receiptsRecent === 1 ? "" : "s"} / week`,
      href: spotlightHome ? `/dashboard/household/${spotlightHome.id}?view=receipts` : "/dashboard/more",
      tone: "violet",
    });
  }

  return (
    <div className="dm-page-enter mx-auto w-full max-w-[1240px] pb-12">
      {/* Hero */}
      <section className="dm-home-hero dm-card-enter relative px-6 pb-8 pt-6 lg:px-8 lg:pb-9 lg:pt-8">
        <span className="dm-home-hero__mesh dm-ambient-drift" aria-hidden />
        <span className="dm-home-hero__grid dm-ambient-drift-rev" aria-hidden />
        <div className="relative z-[1] flex flex-col gap-8 lg:flex-row lg:items-stretch lg:justify-between lg:gap-10">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-[color-mix(in_srgb,var(--dm-electric)_35%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-electric)_10%,white)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--dm-electric-deep)]">
                {householdName ? `${householdName}` : "Koti home"}
              </span>
              {hasHouseholds ? (
                <span className="dm-chip border-[color-mix(in_srgb,var(--dm-social)_22%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-social)_6%,white)]">
                  {roommateMembers.length} roommates
                </span>
              ) : null}
            </div>
            <h1 className="mt-4 text-[2.1rem] font-semibold leading-[1.08] tracking-tight text-dm-text sm:text-[2.65rem]">
              Hey {greeting},{householdName ? (
                <>
                  <span className="text-dm-muted"> · </span>
                  <span className="text-[color-mix(in_srgb,var(--dm-electric)_88%,var(--dm-text)_12%)]">
                    here’s how {householdName} is doing
                  </span>
                </>
              ) : (
                <> let’s spin up your place</>
              )}
            </h1>
            <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dm-muted">
              {hasHouseholds ?
                "A warm snapshot across chores, grocery runs, receipts, splits, and the people you share walls with."
              : "Bring your roommate crew in—chores, grocery lists, and shared money unlock as soon as you create a home."}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              <span className="dm-chip">
                <span aria-hidden className="mr-1 opacity-75">
                  ✓
                </span>
                {choresDueTotal} chores open
              </span>
              <span className="dm-chip border-[color-mix(in_srgb,var(--dm-success)_25%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-success)_6%,white)]">
                {openGroceryCount} groceries
              </span>
              <span className="dm-chip border-[color-mix(in_srgb,var(--dm-info)_22%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-info)_5%,white)]">
                {receiptsRecent} receipts · 7d
              </span>
            </div>
          </div>

          <aside className="relative z-[1] w-full shrink-0 lg:max-w-[320px]">
            <div className="dm-home-presence-card h-full p-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-dm-muted">Roommates</p>
              {roommateMembers.length === 0 ? (
                <p className="mt-3 text-sm leading-relaxed text-dm-muted">
                  {hasHouseholds ?
                    "No members loaded yet. Open your home to sync the crew."
                  : "Create a home and invite people you actually live with."}
                </p>
              ) : (
                <ul className="mt-3 space-y-2.5">
                  {roommateMembers.slice(0, 6).map((m) => {
                    const label = m.displayName?.trim() || m.email?.trim() || "Roommate";
                    const initial = label.slice(0, 1).toUpperCase();
                    return (
                      <li key={m.userId}>
                        <Link
                          href={spotlightHome ? `/dashboard/household/${spotlightHome.id}?view=members` : "/dashboard/more"}
                          className="dm-interactive dm-focus-ring flex items-center gap-3 rounded-xl border border-transparent px-1 py-0.5 hover:border-[var(--dm-border)] hover:bg-white/60"
                        >
                          {m.avatarUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element -- member avatars from storage
                            <img
                              src={m.avatarUrl}
                              alt=""
                              className="h-10 w-10 shrink-0 rounded-full border border-[var(--dm-border-strong)] object-cover"
                            />
                          ) : (
                            <span
                              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--dm-border-strong)] bg-dm-surface-mid text-[13px] font-bold text-dm-text"
                              aria-hidden
                            >
                              {initial}
                            </span>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-semibold text-dm-text">{label}</p>
                            <p className="truncate text-[11px] capitalize text-dm-muted">{m.role}</p>
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              )}
              <div className="mt-4 border-t border-[var(--dm-border)] pt-3">
                <p className="text-[11px] text-dm-muted">
                  {spotlightHome ?
                    <>Shared space · </> : null}
                  <span className="font-semibold text-dm-text">{choresOpenHome}</span> chore
                  {choresOpenHome === 1 ? "" : "s"} here ·{" "}
                  <span className="font-semibold text-[color-mix(in_srgb,var(--dm-info)_92%,var(--dm-text)_8%)]">
                    {owedLabel}
                  </span>
                </p>
              </div>
            </div>
          </aside>
        </div>
      </section>

      {/* Focus */}
      <section className="dm-home-focus dm-card-enter relative z-[1] mt-7 px-6 py-6 lg:mt-9 lg:flex lg:items-center lg:gap-12 lg:px-9 lg:py-8" style={{ animationDelay: "50ms" }}>
        <div className="relative min-w-0 flex-1">
          <p className="dm-home-focus-kicker">{focusKicker}</p>
          <h2 className="mt-3 break-words text-[1.55rem] font-semibold leading-tight tracking-tight text-dm-text lg:text-[1.95rem]">
            {focusTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-[14px] leading-relaxed text-dm-muted">{focusSubtitle}</p>
          <div className="mt-5 flex flex-wrap items-center gap-3">
            <Link
              href={focusHref}
              className="dm-interactive dm-focus-ring inline-flex items-center rounded-full border border-[color-mix(in_srgb,var(--dm-electric)_45%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-electric)_12%,white)] px-5 py-2.5 text-sm font-semibold text-[var(--dm-electric-deep)] shadow-[0_8px_20px_color-mix(in_srgb,var(--dm-electric)_14%,transparent)]"
            >
              {focusLinkLabel}
            </Link>
            {spotlightHome ? (
              <Link
                href={`/dashboard/household/${spotlightHome.id}`}
                className="text-sm font-semibold text-dm-muted underline decoration-dashed underline-offset-[5px] hover:text-dm-electric hover:decoration-solid"
              >
                Open household board
              </Link>
            ) : null}
          </div>
        </div>
        {also.length > 0 ? (
          <div className="mt-8 min-w-[min(100%,260px)] shrink-0 space-y-2 border-t border-[var(--dm-border-strong)] pt-6 lg:mt-0 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-dm-muted">Also on the radar</p>
            <ul className="flex flex-col gap-2">
              {also.slice(0, 4).map((a) => (
                <li key={a.key}>
                  <Link
                    href={a.href}
                    className={[
                      "dm-interactive dm-focus-ring block rounded-xl border px-3 py-2.5 text-[13px] font-semibold leading-snug transition-colors",
                      a.tone === "mint"
                        ? "border-[color-mix(in_srgb,var(--dm-accent)_26%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-accent)_7%,white)] text-dm-text"
                        : a.tone === "violet"
                          ? "border-[color-mix(in_srgb,var(--dm-social)_28%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-social)_8%,white)] text-dm-text"
                          : "border-[color-mix(in_srgb,var(--dm-electric)_24%,var(--dm-border-strong))] bg-white/70 text-dm-text",
                    ].join(" ")}
                  >
                    {a.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </section>

      {/* Quick + today */}
      <div className="dm-dashboard-grid mt-8">
        <section className="dm-module dm-module-muted dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-4" style={{ animationDelay: "90ms" }}>
          <h2 className="dm-section-heading text-[1rem]">Shortcuts</h2>
          <p className="mt-1 text-[12px] text-dm-muted">Jump into the flows you use most.</p>
          <div className="mt-4">
            <DashboardQuickActions />
          </div>
        </section>

        <section className="dm-today-rail dm-hover-lift dm-card-enter col-span-12 p-4 lg:col-span-8" style={{ animationDelay: "120ms" }}>
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <h2 className="dm-section-heading text-[1rem]">Today across homes</h2>
              <p className="mt-1 text-[12px] text-dm-muted">Tiny vitals that keep the shared place honest.</p>
            </div>
          </div>
          <div className="mt-4">
            <TodayStrip
              choresDue={choresDueTotal}
              owedLabel={owedLabel}
              receiptsRecent={receiptsRecent}
              groceriesLabel={groceriesLabel}
              hasHouseholds={hasHouseholds}
            />
          </div>
        </section>
      </div>

      {/* Previews */}
      <div className="dm-dashboard-grid mt-6">
        <section className="dm-preview-money dm-scroll-reveal dm-scroll-reveal-slow dm-hover-lift relative col-span-12 flex flex-col p-5 pb-7 lg:col-span-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--dm-info)_65%,var(--dm-muted)_35%)]">
                Ledger
              </p>
              <h2 className="mt-2 text-lg font-semibold tracking-tight text-dm-text">Money</h2>
            </div>
            <span className="rounded-lg border border-[var(--dm-border)] bg-white/80 px-2 py-1 text-[10px] font-semibold text-dm-muted" aria-hidden>
              ∿∿∿
            </span>
          </div>
          <p className="mt-2 text-[13px] leading-relaxed text-dm-muted">Open balances and who still owes from shared bills.</p>
          <p className="mt-4 min-w-0 break-words text-[1.15rem] font-semibold leading-snug text-dm-text">{owedLabel}</p>
          <p className="mt-2 text-[12px] text-dm-muted">
            {openBillsCount} pending bill{openBillsCount === 1 ? "" : "s"} ·{" "}
            {latestExpense ? `${latestExpense.title}` : "Log a new split anytime"}
          </p>
          {latestExpense ? (
            <p className="mt-1 font-mono text-[13px] font-semibold text-dm-text">{latestExpense.amountFormatted}</p>
          ) : null}
          <div className="mt-auto pt-6">
            <Link href="/dashboard/finances" className="dm-preview-link">
              Open money hub <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <section className="dm-preview-groceries dm-scroll-reveal dm-scroll-reveal-slow dm-hover-lift col-span-12 p-5 lg:col-span-3">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--dm-accent)_70%,var(--dm-muted)_30%)]">
            Pantry board
          </p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-dm-text">Groceries</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-dm-muted">
            {openGroceryCount} still on the list{openGroceryCount ? "." : " — you’re stocked."}
          </p>
          <ul className="mt-4 space-y-2">
            {openGroceries.slice(0, 4).map((item) => (
              <li
                key={item.id}
                className="flex items-start gap-2 rounded-lg border border-[color-mix(in_srgb,var(--dm-accent)_15%,var(--dm-border))] bg-white/55 px-2.5 py-2 text-[13px] text-dm-text"
              >
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-dashed border-[var(--dm-border-strong)] text-[10px] text-dm-muted" aria-hidden>
                  ◻
                </span>
                <span className="min-w-0 flex-1 leading-snug">
                  <span className="block truncate font-medium">{item.name}</span>
                  {item.priority === "high" ? (
                    <span className="mt-0.5 inline-block text-[10px] font-semibold uppercase tracking-wide text-[var(--dm-electric-deep)]">
                      Priority
                    </span>
                  ) : null}
                </span>
              </li>
            ))}
            {openGroceryCount === 0 ? (
              <li className="rounded-lg border border-dashed border-[var(--dm-border-strong)] px-3 py-3 text-[12px] text-dm-muted">
                Nothing waiting—add items before the next store run.
              </li>
            ) : null}
          </ul>
          <div className="mt-5">
            <Link href="/dashboard/inventory" className="dm-preview-link">
              Open grocery list <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <section className="dm-preview-chores dm-scroll-reveal dm-scroll-reveal-slow dm-hover-lift col-span-12 p-5 lg:col-span-4">
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-dm-muted">Task pinboard</p>
          <h2 className="mt-2 text-lg font-semibold tracking-tight text-dm-text">Chores</h2>
          <p className="mt-2 text-[13px] leading-relaxed text-dm-muted">
            {choresOpenHome} open in {householdName ?? "this home"}.
          </p>
          <div className="mt-4 rounded-xl border border-[color-mix(in_srgb,var(--dm-highlight)_35%,var(--dm-border-strong))] bg-white/55 px-3.5 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">On deck</p>
            <p className="mt-1 line-clamp-3 text-[15px] font-semibold leading-snug text-dm-text">
              {nextTask?.title ?? "No urgent task—enjoy the calm."}
            </p>
            {dueLabel ? <p className="mt-2 text-[12px] text-dm-muted">Due {dueLabel}</p> : null}
          </div>
          <ul className="mt-3 space-y-1.5 text-[12px] text-dm-muted">
            <li className="flex gap-2">
              <span aria-hidden>▸</span>
              <span>
                {choresDueTotal} total open across every home you’re in.
              </span>
            </li>
          </ul>
          <div className="mt-5">
            <Link href="/dashboard/tasks" className="dm-preview-link">
              Open chore list <span aria-hidden>→</span>
            </Link>
          </div>
        </section>

        <section className="dm-preview-events dm-scroll-reveal dm-scroll-reveal-slow dm-hover-lift col-span-12 p-5 lg:col-span-12">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[color-mix(in_srgb,var(--dm-social)_55%,var(--dm-muted)_45%)]">
                Calendar strip
              </p>
              <h2 className="mt-1 text-lg font-semibold tracking-tight text-dm-text">Upcoming</h2>
            </div>
            <Link
              href={spotlightHome ? `/dashboard/household/${spotlightHome.id}?view=events` : "/dashboard/more"}
              className="dm-preview-link"
            >
              Full schedule <span aria-hidden>→</span>
            </Link>
          </div>
          <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {upcomingEvents.slice(0, 3).map((ev) => (
              <li
                key={ev.id}
                className="relative overflow-hidden rounded-xl border border-[color-mix(in_srgb,var(--dm-social)_18%,var(--dm-border))] bg-white/70 px-3.5 py-3 pl-4"
              >
                <span
                  className="absolute left-0 top-0 h-full w-1 bg-[linear-gradient(180deg,var(--dm-social),var(--dm-electric))]"
                  aria-hidden
                />
                <p className="text-sm font-semibold text-dm-text">{ev.title}</p>
                <p className="mt-1 text-[12px] text-dm-muted">{fmtEventStart(ev.startsAt)}</p>
              </li>
            ))}
            {upcomingEvents.length === 0 ? (
              <li className="col-span-full rounded-xl border border-dashed border-[var(--dm-border-strong)] px-4 py-6 text-center text-[13px] text-dm-muted">
                No events scheduled—add house dinners, rent reminders, or movie nights.
              </li>
            ) : null}
          </ul>
        </section>
      </div>

      {/* Activity stage */}
      <div className="dm-dashboard-grid mt-6">
        <div className="dm-activity-stage dm-scroll-reveal dm-scroll-reveal-slow col-span-12 overflow-hidden p-1 lg:col-span-12">
          {activityPanel}
        </div>
      </div>
    </div>
  );
}
