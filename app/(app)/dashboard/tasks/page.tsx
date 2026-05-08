import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateHouseholdTaskForm } from "@/components/tasks/create-household-task-form";
import {
  HouseholdCompletedTaskList,
  HouseholdTaskList,
} from "@/components/tasks/household-task-list";
import { MobileScrollViewport } from "@/components/mobile/mobile-scroll-viewport";
import { MobileTasksContent } from "@/components/mobile/mobile-tasks-content";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadHouseholdMembers, loadHouseholdSummaries } from "@/lib/households/queries";
import {
  loadOpenTasksForUser,
  loadRecentCompletedTasksForUser,
} from "@/lib/tasks/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Chores",
};

export default async function DashboardTasksPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/tasks");
  }

  const { households, error: hhErr } = await loadHouseholdSummaries(user.id);
  const { tasks, error: taskErr } = await loadOpenTasksForUser(user.id);
  const hhIds = households.map((h) => h.id);
  const { tasks: doneRecently } = await loadRecentCompletedTasksForUser(hhIds, 14);

  const ids = [
    ...new Set(
      [...tasks, ...doneRecently]
        .flatMap((t) => [t.assignedToUserId, t.completedByUserId])
        .filter((x): x is string => !!x),
    ),
  ];

  let profileMap: Record<string, string> = {};

  if (ids.length > 0) {
    const { data: profs } = await supabase
      .from("profiles")
      .select("id, display_name")
      .in("id", ids);

    profileMap = Object.fromEntries(
      (profs ?? []).map((p) => {
        const row = p as { id: string; display_name: string | null };
        const dn = row.display_name?.trim();
        return [
          row.id,
          dn && dn.length ? dn : `Mate · ${row.id.slice(0, 6)}`,
        ] as const;
      }),
    );
  }

  const memberLabels = profileMap;

  let assignOptions:
    | { userId: string; label: string }[]
    | undefined;

  if (households.length === 1) {
    const m = await loadHouseholdMembers(households[0]!.id);
    if (Array.isArray(m)) {
      assignOptions = m.map((mem) => ({
        userId: mem.userId,
        label:
          mem.displayName?.trim()
            ?? mem.email?.trim()
            ?? `Mate · ${mem.userId.slice(0, 6)}`,
      }));
    }
  }

  const householdOptions = households.map((h) => ({ id: h.id, name: h.name }));

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-2xl flex-1 flex-col overflow-hidden space-y-0 lg:max-w-[58rem] lg:block lg:flex-none lg:space-y-8 lg:overflow-visible">
      <header className="dm-module dm-module-depth relative hidden overflow-hidden px-6 pb-6 pt-5 lg:block">
        <div
          className="dm-ambient-drift-rev absolute right-6 top-5 h-16 w-16 rounded-full border border-[var(--dm-border)] bg-[radial-gradient(circle_at_30%_30%,rgba(200,104,69,0.26),transparent_65%)]"
          aria-hidden
        />
        <div className="dm-chip dm-chip-accent">Chore cockpit</div>
        <h1 className="mt-3 text-[2rem] font-semibold tracking-tight text-dm-text">Chores board</h1>
        <p className="mt-1 text-[13px] text-dm-muted">
          Keep chores moving without group-chat chaos.&nbsp;
          <Link href="/dashboard" className="font-semibold text-dm-electric hover:underline">
            Back to Home
          </Link>
        </p>
      </header>

      <header className="flex shrink-0 items-end justify-between gap-3 border-b border-[var(--dm-border-strong)] pb-2 pt-1 lg:hidden">
        <div className="min-w-0">
          <h1 className="text-[1.2rem] font-bold leading-tight tracking-tight text-dm-text">Chores</h1>
          <p className="mt-0.5 line-clamp-2 text-[11px] leading-snug text-dm-muted">
            Knock tasks off · {tasks.length} open
          </p>
        </div>
        <span className="shrink-0 rounded-full border border-[color-mix(in_srgb,var(--dm-accent)_26%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-accent)_12%,white)] px-3 py-1 text-[11px] font-bold tabular-nums text-dm-text">
          {tasks.length}
        </span>
      </header>

      <MobileScrollViewport className="px-0 pb-3 pt-3 sm:px-0">
        <div className="space-y-3 lg:space-y-8">
          {hhErr ? (
            <div
              role="alert"
              className="dm-fade-in-up rounded-2xl border border-dm-danger/40 bg-[color-mix(in_srgb,var(--dm-danger)_8%,transparent)] px-4 py-3 text-sm text-dm-danger"
            >
              {shouldExposeSupabaseError() ? hhErr : PUBLIC_TRY_AGAIN}
            </div>
          ) : null}

          {taskErr ? (
            <div
              role="alert"
              className="dm-fade-in-up rounded-2xl border border-[color-mix(in_srgb,var(--dm-fun)_45%,transparent)] bg-[var(--dm-accent-warn-bg)] px-4 py-3 text-sm text-[var(--dm-accent-warn-text)]"
            >
              Chore list didn&apos;t load — run{" "}
              <code className="font-mono text-xs">schema.sql</code> tasks section in
              Supabase?{" "}
              {shouldExposeSupabaseError() ? taskErr : PUBLIC_TRY_AGAIN}
            </div>
          ) : null}

          <MobileTasksContent
            tasks={tasks}
            doneRecently={doneRecently}
            currentUserId={user.id}
            memberLabels={memberLabels}
          />

          <div className="space-y-3 lg:hidden">
            <h2 className="text-[13px] font-bold uppercase tracking-wide text-dm-muted">New chore</h2>
            {householdOptions.length === 0 ? (
              <p className="rounded-xl border border-dashed border-[var(--dm-border-strong)] px-4 py-4 text-[14px] text-dm-muted">
                Create a household on{" "}
                <Link href="/dashboard" className="text-dm-electric hover:underline">
                  Home
                </Link>{" "}
                first.
              </p>
            ) : (
              <CreateHouseholdTaskForm
                className="space-y-4 rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface p-4 shadow-[0_10px_20px_rgba(45,41,37,0.06)]"
                households={householdOptions}
                memberOptions={assignOptions}
              />
            )}
          </div>
        </div>
      </MobileScrollViewport>

      <section className="hidden gap-6 lg:grid lg:grid-cols-[1.3fr,minmax(290px,390px)]">
        <div className="space-y-3">
          <h2 className="dm-section-heading">Open chores</h2>
          <HouseholdTaskList
            tasks={tasks}
            currentUserId={user.id}
            memberLabels={memberLabels}
          />
          <div className="dm-module mt-8 px-4 py-4">
            <h3 className="text-sm font-semibold text-dm-text">
              Peeled lately
            </h3>
            <HouseholdCompletedTaskList
              tasks={doneRecently}
              memberLabels={memberLabels}
            />
          </div>
        </div>

        <div className="dm-module dm-module-muted p-5">
          <h2 className="dm-section-heading">Create chore</h2>
          <p className="mt-2 text-[13px] text-dm-muted">Add title, assignee, and reward in one quick form.</p>
          {householdOptions.length === 0 ? (
            <p className="mt-4 rounded-md border border-dashed border-[var(--dm-border-strong)] px-3 py-3 text-[13px] text-dm-muted">
              Create a household on{" "}
              <Link href="/dashboard" className="text-dm-electric hover:underline">
                Home
              </Link>{" "}
              first.
            </p>
          ) : (
            <CreateHouseholdTaskForm
              className="mt-6 space-y-4"
              households={householdOptions}
              memberOptions={assignOptions}
            />
          )}
        </div>
      </section>
    </div>
  );
}
