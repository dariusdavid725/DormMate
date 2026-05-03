import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { HouseActivityFeed } from "@/components/dashboard/house-activity-feed";
import { DashboardQuickActions } from "@/components/dashboard/quick-actions";
import { TodayStrip } from "@/components/dashboard/today-strip";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadHouseActivityItems } from "@/lib/dashboard/house-activity";
import { countReceiptsSince } from "@/lib/dashboard/home-metrics";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { loadReceiptFeedPreview } from "@/lib/receipts/feed-queries";
import { loadOpenTasksForUser } from "@/lib/tasks/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Home",
};

function formatEuro(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);
  } catch {
    return `€${n.toFixed(2)}`;
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
  const { tasks: openTasks } = await loadOpenTasksForUser(user.id);
  const { items: receiptFeed } = await loadReceiptFeedPreview(households);

  const receiptsLast7d = countReceiptsSince(receiptFeed, 7);

  const { items: houseActivity, error: activityErr } =
    await loadHouseActivityItems(households, receiptFeed, 8);

  const owedPreview = formatEuro(0);

  const hasHouseholds = households.length > 0;

  return (
    <div className="mx-auto w-full max-w-lg pb-24 lg:max-w-3xl lg:pb-12">
      <header className="border-b border-[var(--dm-border-strong)] pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-dm-text">
          Home
        </h1>
        {!hasHouseholds ? (
          <p className="mt-1 text-[13px] text-dm-muted">
            Create a household to track tasks and receipts.
          </p>
        ) : null}
      </header>

      {error ? (
        <div
          role="alert"
          className="mt-6 rounded-lg border border-dm-danger/30 px-4 py-3 text-sm text-dm-danger"
        >
          {shouldExposeSupabaseError() ? error : PUBLIC_TRY_AGAIN}
        </div>
      ) : null}

      <div className="mt-6 space-y-8">
        <TodayStrip
          choresDue={openTasks.length}
          owedLabel={owedPreview}
          receiptsRecent={receiptsLast7d}
          hasHouseholds={hasHouseholds}
        />

        <DashboardQuickActions />

        <section aria-labelledby="activity-heading">
          <div className="mb-3 flex flex-wrap items-baseline gap-2">
            <h2
              id="activity-heading"
              className="text-[13px] font-semibold text-dm-muted"
            >
              Recent activity
            </h2>
            <Link
              href="/dashboard/tasks"
              className="text-[12px] font-medium text-dm-electric hover:underline"
            >
              Tasks
            </Link>
            <Link
              href="/dashboard/finances"
              className="text-[12px] font-medium text-dm-electric hover:underline"
            >
              Money
            </Link>
          </div>
          {activityErr ? (
            <p className="mb-2 text-[12px] text-dm-danger">Activity partial.</p>
          ) : null}
          <HouseActivityFeed items={houseActivity} />
        </section>
      </div>

      {!hasHouseholds ? (
        <section
          id="create-household"
          className="mt-10 scroll-mt-24 rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-5"
          aria-labelledby="hh-new"
        >
          <h2 id="hh-new" className="text-sm font-medium text-dm-text">
            New household
          </h2>
          <p className="mt-1 text-[13px] text-dm-muted">
            Needed before tasks and receipts.
          </p>
          <CreateHouseholdForm className="mt-4 space-y-4" />
        </section>
      ) : null}
    </div>
  );
}
