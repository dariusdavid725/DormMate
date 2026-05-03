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
    <div className="mx-auto w-full max-w-2xl space-y-10 pb-[7.5rem] lg:max-w-4xl lg:pb-10">
      <header className="relative overflow-hidden border border-[var(--dm-border-strong)] border-l-[3px] border-l-dm-electric bg-dm-surface/72 p-6 shadow-xl shadow-black/[0.05] backdrop-blur-md sm:p-8">
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-12%] top-[-30%] h-52 w-[55%] bg-[var(--dm-electric-glow)] opacity-60 blur-3xl dark:opacity-80"
        />
        <p className="relative text-[11px] font-bold uppercase tracking-[0.25em] text-dm-electric">
          Tasks
        </p>
        <h1 className="relative mt-3 text-3xl font-extrabold tracking-tight text-dm-text md:text-[2.15rem]">
          Tasks with tiny rewards — not spreadsheets.
        </h1>
        <p className="relative mt-4 max-w-prose text-[15px] leading-relaxed text-dm-muted">
          Drop work for your dorm or flat. Whoever clears it earns the points you
          set — good for karma, coffees, first pick at movie nights.
        </p>
        <p className="relative mt-4 text-xs text-dm-muted">
          <Link href="/dashboard" className="font-semibold text-dm-electric hover:underline">
            ← Dashboard
          </Link>
          <span className="mx-2 opacity-30">/</span>
          <span>Shared money stays on Receipts · Finances</span>
        </p>
      </header>

      {hhErr ? (
        <div
          role="alert"
          className="rounded-2xl border border-dm-danger/35 bg-red-500/[0.06] px-4 py-3 text-sm text-dm-danger"
        >
          {shouldExposeSupabaseError() ? hhErr : PUBLIC_TRY_AGAIN}
        </div>
      ) : null}

      {taskErr ? (
        <div
          role="alert"
          className="rounded-2xl border border-amber-400/35 bg-[var(--dm-accent-warn-bg)] px-4 py-3 text-sm text-[var(--dm-accent-warn-text)]"
        >
          Chore list didn&apos;t load — run{" "}
          <code className="font-mono text-xs">schema.sql</code> tasks section in
          Supabase?{" "}
          {shouldExposeSupabaseError() ? taskErr : PUBLIC_TRY_AGAIN}
        </div>
      ) : null}

      <section className="grid gap-10 lg:grid-cols-[1fr,minmax(280px,0.92fr)]">
        <div className="space-y-4">
          <h2 className="text-xs font-black uppercase tracking-[0.2em] text-dm-muted">
            Open chores
          </h2>
          <HouseholdTaskList tasks={tasks} />
        </div>

        <div className="rounded-2xl border border-[var(--dm-border-strong)] bg-[color-mix(in_srgb,var(--dm-fun)_12%,transparent)] p-6 shadow-inner dark:bg-dm-surface/40 lg:p-8">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-dm-text">
            New chore
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dm-muted">
            Short headline, optional perk — teammates claim it when they crush it.
          </p>
          {householdOptions.length === 0 ? (
            <p className="mt-6 text-sm font-medium leading-relaxed text-dm-muted">
              Create a space first — then chores unlock.{" "}
              <Link
                href="/dashboard#create-household"
                className="font-semibold text-dm-electric underline decoration-dm-electric/40 underline-offset-2"
              >
                Jump to Home
              </Link>
              .
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
