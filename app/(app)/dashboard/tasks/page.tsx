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
    <div className="mx-auto w-full max-w-2xl space-y-8 pb-24 lg:max-w-[58rem] lg:pb-9">
      <header className="dm-panel-ribbon dm-card-interactive overflow-hidden rounded-[1.35rem] p-5 sm:p-7">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-dm-electric">
          Chore arcade
        </p>
        <h1 className="mt-2 text-[1.95rem] font-black leading-[1.1] tracking-tight text-dm-text md:text-[2.25rem]">
          Tasks · tiny bribery, giant peace
        </h1>
        <p className="relative mt-3 max-w-prose text-[15px] leading-relaxed text-dm-muted">
          Drop jobs for your dorm squad. Finishers snag the shine (and literal points
          toward whatever your flat bans or rewards).
        </p>
        <p className="relative mt-4 text-[12px] font-semibold text-dm-muted">
          <Link href="/dashboard" className="text-dm-electric underline decoration-dm-electric/40 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40">
            ← Dashboard
          </Link>
          <span className="mx-2 opacity-35">·</span>
          <span>Dollars live under Money / Receipts when you&apos;re reconciling ramen economics.</span>
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
        <div className="space-y-3">
          <h2 className="text-[11px] font-black uppercase tracking-[0.26em] text-dm-muted">
            Open chores · claim your legend
          </h2>
          <HouseholdTaskList tasks={tasks} />
        </div>

        <div className="dm-card-surface dm-card-interactive rounded-[1.35rem] p-6 lg:p-7">
          <h2 className="text-[11px] font-black uppercase tracking-[0.22em] text-dm-text">
            New chore drop
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-dm-muted">
            One spicy title, juicy points — your crew raids it whenever adulting strikes.
          </p>
          {householdOptions.length === 0 ? (
            <p className="mt-6 rounded-xl border border-dashed border-[color-mix(in_srgb,var(--dm-electric)_24%,transparent)] bg-[color-mix(in_srgb,var(--dm-bg)_78%,transparent)] px-4 py-4 text-sm font-medium leading-relaxed text-dm-muted">
              No crib yet · manifest one on Home, then hustle back here.{" "}
              <Link
                href="/dashboard#create-household"
                className="font-bold text-dm-electric underline decoration-dm-electric/45 underline-offset-2"
              >
                Jump shortcut
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
