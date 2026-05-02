import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Overview",
};

function formatJoined(iso: string) {
  try {
    const d = new Date(iso);
    return new Intl.DateTimeFormat(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    }).format(d);
  } catch {
    return "";
  }
}

export default async function DashboardOverviewPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { households, error } = await loadHouseholdSummaries(user.id);

  return (
    <div className="mx-auto w-full max-w-6xl">
      <header className="mb-10 max-w-2xl">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 md:text-[2rem] dark:text-white">
          Overview
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
          Manage shared households, open each space for balances, staples, and
          chores — starting with clarity on who belongs where.
        </p>
      </header>

      {error ? (
        <div
          role="alert"
          className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-950 dark:border-amber-900/70 dark:bg-amber-950/35 dark:text-amber-50"
        >
          <p className="font-medium">Could not load households</p>
          <p className="mt-1 opacity-90">
            {shouldExposeSupabaseError() ? error : PUBLIC_TRY_AGAIN}
          </p>
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[1fr,minmax(16rem,22rem)] lg:gap-12">
        <section aria-labelledby="your-households">
          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2
                id="your-households"
                className="text-lg font-semibold tracking-tight text-zinc-900 dark:text-white"
              >
                Your households
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                {households.length === 0
                  ? "Create your first household to invite roommates soon."
                  : `${households.length} linked space${households.length === 1 ? "" : "s"}.`}
              </p>
            </div>
          </div>

          <ul className="grid gap-4 sm:grid-cols-2">
            {households.map((h) => (
              <li key={h.id}>
                <Link
                  href={`/dashboard/household/${h.id}`}
                  prefetch
                  className="group flex flex-col rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:border-emerald-500/40 hover:shadow-md dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:border-emerald-500/35"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[17px] font-semibold tracking-tight text-zinc-900 group-hover:text-emerald-900 dark:text-white dark:group-hover:text-emerald-300">
                      {h.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-emerald-600/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-100">
                      {h.role}
                    </span>
                  </div>
                  <span className="mt-6 text-[11px] font-medium uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
                    Member since
                  </span>
                  <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    {formatJoined(h.joinedAt)}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-emerald-700 group-hover:gap-2 dark:text-emerald-400">
                    Open workspace
                    <span aria-hidden>→</span>
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <aside className="lg:pt-14">
          <div className="sticky top-[5.75rem] space-y-6">
            <div className="rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm ring-1 ring-black/[0.02] dark:border-zinc-800 dark:bg-zinc-900/70 dark:ring-white/[0.04]">
              <h3 className="text-sm font-semibold text-zinc-900 dark:text-white">
                Create household
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                One shared space for receipts, staples, chores, and fair
                settle-up — onboarding stays minimal for now.
              </p>
              <CreateHouseholdForm className="mt-5 space-y-4" />
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
