import type { Metadata } from "next";
import type { ReactNode } from "react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RenameHouseholdForm } from "@/components/dashboard/rename-household-form";
import { EventDraftFormEmbedded } from "@/components/events/event-draft-form-embedded";
import { HouseholdEventsPanel } from "@/components/events/household-events-panel";
import { ManualExpenseForm } from "@/components/expenses/manual-expense-form";
import { HouseholdExpenseList } from "@/components/expenses/household-expense-list";
import { HouseholdNetBalances } from "@/components/expenses/household-net-balances";
import { HouseholdMembersPanel } from "@/components/household/household-members-panel";
import { ReceiptList } from "@/components/receipts/receipt-list";
import { ReceiptScannerPanel } from "@/components/receipts/receipt-scanner-panel";
import { CreateHouseholdTaskForm } from "@/components/tasks/create-household-task-form";
import {
  HouseholdCompletedTaskList,
  HouseholdTaskList,
} from "@/components/tasks/household-task-list";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadEventRsvps, loadHouseholdEvents } from "@/lib/events/queries";
import {
  loadExpenseSplits,
  loadHouseholdExpenseBalances,
  loadHouseholdExpenses,
} from "@/lib/expenses/queries";
import type { HouseholdMemberRow } from "@/lib/households/queries";
import {
  loadHouseholdDetail,
  loadHouseholdMembers,
  loadHouseholdSummaries,
} from "@/lib/households/queries";
import { loadReceiptsForHousehold } from "@/lib/receipts/queries";
import {
  loadCompletedTasksForHousehold,
  loadOpenTasksForHousehold,
} from "@/lib/tasks/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

type View =
  | "overview"
  | "tasks"
  | "members"
  | "receipts"
  | "expenses"
  | "events";

function labelMember(m: HouseholdMemberRow): string {
  if (m.displayName?.trim()) return m.displayName.trim();
  if (m.email?.trim()) return m.email.trim();
  return `Mate · ${m.userId.slice(0, 6)}`;
}

type PageProps = {
  params: Promise<{ id: string }>;
  searchParams?: Promise<{ view?: string }>;
};

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user?.id) {
    return { title: "Household" };
  }
  const loaded = await loadHouseholdDetail(user.id, id);
  if (!loaded.ok) {
    return { title: "Household" };
  }
  return { title: loaded.household.name };
}

function formatDate(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default async function HouseholdDetailPage(props: PageProps) {
  const { id } = await props.params;
  const resolvedSearch =
    props.searchParams != null ? await props.searchParams : {};
  const rawView = resolvedSearch.view;
  const view: View =
    rawView === "members"
      ? "members"
      : rawView === "receipts"
        ? "receipts"
        : rawView === "tasks"
          ? "tasks"
          : rawView === "expenses"
            ? "expenses"
            : rawView === "events"
              ? "events"
              : "overview";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect(`/login?next=${encodeURIComponent(`/dashboard/household/${id}`)}`);
  }

  const detail = await loadHouseholdDetail(user.id, id);
  if (!detail.ok) {
    notFound();
  }

  const { households } = await loadHouseholdSummaries(user.id);

  const { household, memberRole } = detail;

  const needsMembers =
    view === "tasks" ||
    view === "members" ||
    view === "expenses" ||
    view === "events" ||
    view === "receipts";

  const memberBundle = needsMembers ? await loadHouseholdMembers(id) : null;

  const membersList: HouseholdMemberRow[] =
    memberBundle != null && !("error" in memberBundle)
      ? memberBundle
      : ([] as HouseholdMemberRow[]);

  const memberLabels = Object.fromEntries(
    membersList.map((m) => [m.userId, labelMember(m)] as const),
  );

  const membersResult = view === "members" ? memberBundle : null;

  const receiptsPayload =
    view === "receipts" ? await loadReceiptsForHousehold(id) : null;

  const tasksPayload =
    view === "tasks" ? await loadOpenTasksForHousehold(id) : null;

  const doneTasksPayload =
    view === "tasks" ? await loadCompletedTasksForHousehold(id, 20) : null;

  const expensesPayload =
    view === "expenses" || view === "receipts"
      ? await loadHouseholdExpenses(id)
      : null;

  const balancePayload =
    view === "expenses" ?
      await loadHouseholdExpenseBalances(id)
    : null;

  const splitsPayload =
    view === "expenses" &&
    expensesPayload?.expenses &&
    expensesPayload.expenses.length ?
      await loadExpenseSplits(expensesPayload.expenses.map((e) => e.id))
    : null;

  const linkedReceiptIds =
    view === "receipts"
      ? (expensesPayload?.expenses ?? [])
          .map((e) => e.sourceReceiptId)
          .filter((x): x is string => !!x)
      : [];

  const eventsPayload =
    view === "events" ? await loadHouseholdEvents(id) : null;

  const eventIds =
    view === "events" && eventsPayload?.events?.length ?
      eventsPayload.events.map((e) => e.id)
    : [];

  const rsvpPayload =
    view === "events" && eventIds.length ?
      await loadEventRsvps(eventIds)
    : null;

  const canRename = household.createdBy === user.id;

  const tabBase = `/dashboard/household/${id}`;

  return (
    <div className="mx-auto w-full max-w-6xl pb-28 lg:pb-16">
      <nav aria-label="Breadcrumb" className="mb-5 text-[13px] font-medium text-dm-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/dashboard" className="font-semibold hover:text-dm-electric">
              Home
            </Link>
          </li>
          <li aria-hidden className="opacity-35">
            /
          </li>
          <li className="truncate text-dm-text">{household.name}</li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-5 border-b border-dashed border-[var(--dm-border-strong)] pb-7">
        <div className="min-w-0 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
            Household corkboard
          </p>
          <h1 className="font-cozy-display mt-2 text-[2.75rem] leading-[1.05] tracking-tight text-dm-text md:text-[3.1rem]">
            {household.name}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
            You&apos;re{" "}
            <span className="font-semibold capitalize text-dm-text">
              {memberRole}
            </span>
            · since {formatDate(household.createdAt)}.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <span className="inline-flex rounded-full bg-dm-elevated/80 px-3 py-1.5 text-xs font-medium text-dm-text ring-1 ring-[var(--dm-border)]">
            {households.length} space{households.length === 1 ? "" : "s"}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-[var(--dm-border-strong)] px-4 py-1.5 text-xs font-semibold text-dm-muted transition hover:border-dm-electric hover:text-dm-electric"
          >
            Home
          </Link>
        </div>
      </div>

      <div className="mt-7 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible sm:flex-wrap [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-0 shrink-0 gap-1 rounded-[3px] border border-dashed border-[var(--dm-border-strong)] bg-dm-surface p-1 shadow-[var(--cozy-shadow-paper)]">
          <TabLink active={view === "overview"} href={tabBase} label="Overview" />
          <TabLink active={view === "tasks"} href={`${tabBase}?view=tasks`} label="Tasks" />
          <TabLink active={view === "expenses"} href={`${tabBase}?view=expenses`} label="$" />
          <TabLink active={view === "events"} href={`${tabBase}?view=events`} label="Events" />
          <TabLink active={view === "members"} href={`${tabBase}?view=members`} label="Members" />
          <TabLink active={view === "receipts"} href={`${tabBase}?view=receipts`} label="Receipts" />
        </div>
      </div>

      {view === "overview" ? (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <OverviewCard href={`${tabBase}?view=receipts`}>
              Receipts · scan slips
            </OverviewCard>
            <OverviewVariant href={`${tabBase}?view=tasks`} variant="note">
              Tasks · stickies
            </OverviewVariant>
            <OverviewCard href={`${tabBase}?view=expenses`}>
              Bills · split tab
            </OverviewCard>
            <OverviewVariant href={`${tabBase}?view=events`} variant="poster">
              Events · RSVPs
            </OverviewVariant>
            <OverviewCard href={`${tabBase}?view=members`}>
              Crew · invites
            </OverviewCard>
            <OverviewCard href="/dashboard/join">
              Join another pad
            </OverviewCard>
          </div>

          <section className="dm-card-surface cozy-tilt-xs-alt mt-8 p-5">
            <h2 className="font-cozy-display text-2xl text-dm-text">Flat settings</h2>
            <p className="mt-2 text-sm text-dm-muted">
              {canRename
                ? "Rename is available to whoever created this household."
                : "Only the creator can rename this household. Ask them to adjust the display name."}
            </p>
            {canRename ?
              <RenameHouseholdForm
                householdId={household.id}
                initialName={household.name}
              />
            : null}
          </section>
        </>
      ) : view === "tasks" ? (
        <section className="mt-10 space-y-10">
          {!memberBundle ||
          ("error" in memberBundle && memberBundle.error) ?
            <div role="alert" className="text-sm text-dm-danger">
              Couldn&apos;t load member directory for labels.
              {memberBundle &&
              "error" in memberBundle &&
              shouldExposeSupabaseError()
                ? ` ${memberBundle.error}`
                : null}
            </div>
          : null}

          {tasksPayload?.error ?
            <div
              role="alert"
              className="rounded-2xl border border-amber-400/45 bg-[var(--dm-accent-warn-bg)] px-5 py-4 text-sm text-[var(--dm-accent-warn-text)]"
            >
              Chore list unavailable — rerun{" "}
              <code className="rounded border border-amber-500/35 px-1 font-mono">
                schema.sql
              </code>{" "}
              in Supabase ({tasksPayload.error}) so{" "}
              <code className="font-mono">household_tasks</code> exists.
            </div>
          : (
            <>
              <div className="cozy-poster cozy-tilt-xs p-5 sm:p-6">
                <h2 className="font-cozy-display text-2xl text-dm-text">New sticky</h2>
                <CreateHouseholdTaskForm
                  className="mt-6 space-y-4"
                  households={[{ id: household.id, name: household.name }]}
                  fixedHouseholdId={id}
                  memberOptions={membersList.map((m) => ({
                    userId: m.userId,
                    label: labelMember(m),
                  }))}
                />
              </div>
              <div>
                <h2 className="font-cozy-display text-xl text-dm-text">Still on the corkboard</h2>
                <HouseholdTaskList
                  tasks={tasksPayload?.tasks ?? []}
                  currentUserId={user.id}
                  memberLabels={memberLabels}
                />
              </div>
              {doneTasksPayload?.tasks?.length ?
                <div className="cozy-receipt cozy-tilt-xs-alt p-5">
                  <h3 className="text-sm font-semibold text-dm-text">Freshly peeled</h3>
                  <HouseholdCompletedTaskList
                    tasks={doneTasksPayload.tasks}
                    memberLabels={memberLabels}
                  />
                </div>
              : null}
            </>
          )}
        </section>
      ) : view === "members" ? (
        <section className="mt-10">
          {membersResult && "error" in membersResult ?
            <div
              role="alert"
              className="rounded-2xl border border-dm-danger/35 bg-red-500/[0.05] px-5 py-4 text-sm text-dm-danger"
            >
              Could not load members.{" "}
              {shouldExposeSupabaseError() ?
                <>
                  Apply{" "}
                  <code className="border border-dm-danger/40 px-1 font-mono normal-case">
                    schema.sql
                  </code>
                </>
              : (
                PUBLIC_TRY_AGAIN
              )}
            </div>
          : (
            <HouseholdMembersPanel
              members={membersResult as HouseholdMemberRow[]}
              currentUserId={user.id}
              householdId={id}
              inviteCode={household.inviteCode}
              canManageInvites={
                memberRole === "owner" || memberRole === "admin"
              }
              householdCreatorId={household.createdBy}
              currentRole={memberRole}
            />
          )}
        </section>
      ) : view === "receipts" ? (
        <section className="mt-10 space-y-8">
          <ReceiptScannerPanel householdId={id} />
          <div>
            <h2 className="font-cozy-display text-2xl text-dm-text">Receipt pile</h2>
            <p className="mt-1 text-[13px] text-dm-muted">
              Visible to all members of this household.
            </p>
            {receiptsPayload?.error ?
              <p className="mt-4 text-sm font-medium text-dm-danger">
                Couldn&apos;t load receipts · check the receipts table migration.
              </p>
            : (
              <div className="mt-6">
                <ReceiptList
                  receipts={receiptsPayload?.receipts ?? []}
                  emptyHint="No slips yet — add a scanned photo above or jot a manual bill under Money."
                  enableSplitAllAction
                  linkedReceiptIds={linkedReceiptIds}
                  memberOptions={membersList.map((m) => ({
                    userId: m.userId,
                    label: labelMember(m),
                  }))}
                />
              </div>
            )}
          </div>
        </section>
      ) : view === "expenses" ? (
        <section className="mt-10 space-y-12">
          {expensesPayload?.error ?
            <div className="text-sm text-dm-danger">Could not load expenses.</div>
          : (
            <>
              <div className="cozy-poster cozy-tilt-xs p-5">
                <h2 className="font-cozy-display text-3xl text-dm-text">Split the tab</h2>
                <p className="mt-2 max-w-xl text-[13px] text-dm-muted">
                  Manual slips sit beside receipts — totals stay editable until settled.
                </p>
                {membersList.length === 0 ?
                  <p className="mt-4 text-[13px] text-dm-danger">
                    Add housemates before logging splits so everyone stays addressable.
                  </p>
                : (
                  <ManualExpenseForm
                    householdId={id}
                    currentUserId={user.id}
                    members={membersList.map((m) => ({
                      userId: m.userId,
                      label: labelMember(m),
                    }))}
                  />
                )}
              </div>

              <div className="cozy-note cozy-tilt-xs p-5 shadow-[var(--cozy-shadow-note)]">
                <h3 className="font-cozy-display text-2xl text-dm-text">Who owes who</h3>
                <p className="mt-2 text-[12px] text-dm-muted">
                  Snapshot from pending slips only · positive means you floated more than your slice.
                </p>
                {balancePayload?.error ?
                  <p className="mt-4 text-[13px] text-dm-danger">{balancePayload.error}</p>
                : (
                  <HouseholdNetBalances
                    balances={balancePayload?.balances ?? []}
                    memberLabels={memberLabels}
                  />
                )}
              </div>

              <div>
                <h3 className="font-cozy-display text-2xl text-dm-text">Ledger</h3>
                <HouseholdExpenseList
                  householdId={id}
                  expenses={expensesPayload?.expenses ?? []}
                  splitUserIdsByExpenseId={splitsPayload?.byExpense ?? new Map()}
                  memberLabels={memberLabels}
                />
              </div>
            </>
          )}
        </section>
      ) : (
        /* events */
        <section className="mt-10">
          {!memberBundle ||
          ("error" in memberBundle && memberBundle.error) ?
            <div className="text-sm text-dm-danger">Members needed for RSVPs failed to load.</div>
          : null}
          <div className="cozy-poster cozy-tilt-xs p-5 shadow-[var(--cozy-shadow-paper)]">
            <h2 className="font-cozy-display text-3xl text-dm-text">Poster a gathering</h2>
            <p className="mt-2 max-w-xl text-[13px] text-dm-muted">
              Time is local-wall-clock · bring list expects one staple per row.
            </p>
          </div>
          <details className="cozy-note cozy-tilt-xs-alt mx-auto mb-12 mt-10 max-w-2xl px-6 py-4 shadow-[var(--cozy-shadow-note)]">
            <summary className="cursor-pointer font-cozy-display text-2xl text-dm-text">
              Draft flyer
            </summary>
            <EventDraftFormEmbedded householdId={id} />
          </details>
          {eventsPayload?.error ?
            <p className="text-sm text-dm-danger">{eventsPayload.error}</p>
          : (
            <HouseholdEventsPanel
              householdId={id}
              events={eventsPayload?.events ?? []}
              rsvps={rsvpPayload?.rsvps ?? []}
              currentUserId={user.id}
              membersById={memberLabels}
            />
          )}
        </section>
      )}
    </div>
  );
}

function TabLink({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      aria-current={active ? "page" : undefined}
      className={[
        "rounded-sm px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap transition sm:min-w-[5.85rem]",
        active
          ? href.includes("receipts")
            ? "bg-dm-accent-warn-bg text-[var(--dm-accent-warn-text)] ring-1 ring-[var(--dm-border-strong)]"
            : href.includes("events")
              ? "bg-[color-mix(in_srgb,var(--dm-fun)_35%,transparent)] text-dm-text ring-1 ring-[var(--dm-border-strong)]"
              : href.includes("expenses")
                ? "bg-[color-mix(in_srgb,var(--dm-electric)_20%,transparent)] text-dm-electric ring-1 ring-[var(--dm-border-strong)]"
                : "bg-[color-mix(in_srgb,var(--dm-electric)_18%,transparent)] text-dm-electric ring-1 ring-[var(--dm-border-strong)]"
          : "text-dm-muted hover:text-dm-text",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function OverviewCard({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      scroll={false}
      className="cozy-receipt cozy-hover-wiggle rounded-[2px] px-4 py-4 text-center text-sm font-semibold text-dm-text transition hover:brightness-[1.01]"
    >
      {children}
    </Link>
  );
}

function OverviewVariant({
  href,
  children,
  variant,
}: {
  href: string;
  children: ReactNode;
  variant: "note" | "poster";
}) {
  if (variant === "note")
    return (
      <Link
        href={href}
        scroll={false}
        className="cozy-note cozy-hover-wiggle cozy-tilt-xs block rounded-[2px] px-4 py-4 text-center text-sm font-semibold text-dm-text shadow-[var(--cozy-shadow-note)]"
      >
        {children}
      </Link>
    );
  return (
    <Link
      href={href}
      scroll={false}
      className="cozy-poster cozy-hover-wiggle cozy-tilt-xs-alt block px-4 py-4 text-center text-sm font-semibold text-dm-text"
    >
      {children}
    </Link>
  );
}

