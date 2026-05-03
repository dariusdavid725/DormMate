import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateHouseholdTaskForm } from "@/components/tasks/create-household-task-form";
import {
  HouseholdCompletedTaskList,
  HouseholdTaskList,
} from "@/components/tasks/household-task-list";
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
  title: "Tasks",
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
  const { tasks: doneRecently, error: doneErr } =
    await loadRecentCompletedTasksForUser(hhIds, 14);

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
    <div className="mx-auto w-full max-w-2xl space-y-8 pb-24 lg:max-w-[56rem] lg:pb-10">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-6">
        <h1 className="font-cozy-display text-4xl text-dm-text">Task stack</h1>
        <p className="mt-1 text-[13px] text-dm-muted">
          Sticky notes for the flat.&nbsp;
          <Link href="/dashboard" className="font-semibold text-dm-electric hover:underline">
            Board
          </Link>
        </p>
      </header>

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

      <section className="grid gap-8 lg:grid-cols-[1fr,minmax(280px,380px)]">
        <div className="space-y-2">
          <h2 className="font-cozy-display text-xl text-dm-muted">Open stickies</h2>
          <HouseholdTaskList
            tasks={tasks}
            currentUserId={user.id}
            memberLabels={memberLabels}
          />
          <div className="cozy-receipt cozy-tilt-xs-alt mt-8 px-4 py-4">
            <h3 className="text-sm font-semibold text-dm-text">
              Peeled lately
            </h3>
            <HouseholdCompletedTaskList
              tasks={doneRecently}
              memberLabels={memberLabels}
            />
          </div>
        </div>

        <div className="cozy-poster cozy-tilt-xs-alt p-5">
          <h2 className="font-cozy-display text-2xl text-dm-text">New sticky</h2>
          <p className="mt-1 text-[13px] text-dm-muted">
            Title, points, optional note.
          </p>
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
