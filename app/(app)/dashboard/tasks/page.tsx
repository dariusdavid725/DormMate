import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateHouseholdTaskForm } from "@/components/tasks/create-household-task-form";
import { HouseholdTaskList } from "@/components/tasks/household-task-list";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { loadOpenTasksForUser } from "@/lib/tasks/queries";
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

  const householdOptions = households.map((h) => ({ id: h.id, name: h.name }));

  return (
    <div className="mx-auto w-full max-w-2xl space-y-8 pb-24 lg:max-w-[56rem] lg:pb-10">
      <header className="border-b border-[var(--dm-border-strong)] pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-dm-text">
          Tasks
        </h1>
        <p className="mt-1 text-[13px] text-dm-muted">
          Shared chores and points.&nbsp;
          <Link href="/dashboard" className="text-dm-electric hover:underline">
            Home
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
          <h2 className="text-[13px] font-medium text-dm-muted">Open</h2>
          <HouseholdTaskList tasks={tasks} />
        </div>

        <div className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-5">
          <h2 className="text-sm font-medium text-dm-text">New task</h2>
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
            />
          )}
        </div>
      </section>
    </div>
  );
}
