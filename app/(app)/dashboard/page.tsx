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
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800 dark:text-teal-300">
          Workspace
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 md:text-[2rem] dark:text-stone-50">
          Overview
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-stone-600 dark:text-stone-400">
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
                className="text-lg font-semibold tracking-tight text-stone-900 dark:text-stone-50"
              >
                Your households
              </h2>
              <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
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
                  className="group flex flex-col rounded-2xl border border-stone-200/90 bg-white p-5 shadow-sm transition hover:border-teal-400/50 hover:shadow-md dark:border-stone-800 dark:bg-stone-900/50 dark:hover:border-teal-500/40"
                >
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-[17px] font-semibold tracking-tight text-stone-900 group-hover:text-teal-900 dark:text-stone-50 dark:group-hover:text-teal-200">
                      {h.name}
                    </span>
                    <span className="shrink-0 rounded-full bg-teal-600/10 px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-teal-900 dark:bg-teal-500/15 dark:text-teal-100">
                      {h.role}
                    </span>
                  </div>
                  <span className="mt-6 text-[11px] font-medium uppercase tracking-wider text-stone-400 dark:text-stone-500">
                    Member since
                  </span>
                  <span className="text-sm font-medium text-stone-700 dark:text-stone-300">
                    {formatJoined(h.joinedAt)}
                  </span>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-teal-800 group-hover:gap-2 dark:text-teal-300">
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
            <div className="rounded-2xl border border-stone-200/90 bg-white p-6 shadow-sm ring-1 ring-stone-900/[0.03] dark:border-stone-800 dark:bg-stone-900/60 dark:ring-white/[0.04]">
              <h3 className="text-sm font-semibold text-stone-900 dark:text-stone-50">
                Create household
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
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
