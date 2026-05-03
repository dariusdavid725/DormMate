import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ContextualActionChip } from "@/components/dashboard/contextual-action-chip";
import { DashboardFeed } from "@/components/dashboard/dashboard-feed";
import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { DormStatusRing } from "@/components/dashboard/dorm-status-ring";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { loadReceiptFeedPreview } from "@/lib/receipts/feed-queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Pulse",
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
  const primaryId = households[0]?.id ?? null;
  const { items: receiptFeed, error: feedErr } = await loadReceiptFeedPreview(
    households,
  );

  const realReceiptCount = receiptFeed.length;
  const firstHhReceipts = primaryId
    ? receiptFeed.filter((x) => x.householdId === primaryId).length
    : 0;

  const scanHref = primaryId
    ? `/dashboard/household/${primaryId}?view=receipts`
    : null;

  const owedPreview = formatEuro(0);

  const ringFilled = households.length > 0 ? Math.min(households.length, 4) : 0;
  const ringTotal = households.length > 0 ? 4 : 1;
  const ringSubtitle =
    households.length === 0
      ? "No dorm anchored yet"
      : `${households.length} space${households.length === 1 ? "" : "s"} · presence AI soon`;

  return (
    <div className="mx-auto w-full max-w-lg pb-[7.5rem] lg:max-w-6xl lg:pb-10">
      <div className="flex flex-wrap items-center justify-between gap-4 lg:max-w-none">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dm-muted">
            The State of the Dorm
          </p>
          <h1 className="mt-1 text-2xl font-black uppercase tracking-tight text-dm-text">
            Pulse
          </h1>
        </div>
        <DormStatusRing
          filled={ringFilled}
          total={ringTotal}
          subtitle={ringSubtitle}
        />
      </div>

      {error ? (
        <div
          role="alert"
          className="mt-8 border-[3px] border-dm-danger bg-dm-surface px-4 py-3 text-sm text-dm-danger"
        >
          <p className="font-bold">Household sync failed</p>
          <p className="mt-1 opacity-90">
            {shouldExposeSupabaseError() ? error : PUBLIC_TRY_AGAIN}
          </p>
        </div>
      ) : null}

      <div className="mt-10 flex flex-col gap-12 xl:flex-row xl:gap-14">
        <div className="min-w-0 flex-1 space-y-12">
          <section
            aria-labelledby="pulse-money"
            className="rounded-none border-[3px] border-dm-electric bg-dm-surface p-6 shadow-[6px_6px_0_0_var(--dm-border-strong)] lg:p-10"
          >
            <p
              id="pulse-money"
              className="text-[10px] font-black uppercase tracking-[0.28em] text-dm-muted"
            >
              The pulse · ledger preview
            </p>
            <div className="mt-8 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-wide text-dm-muted">
                  You are owed
                </p>
                <p className="mt-2 font-mono text-[clamp(2.75rem,8vw,3.75rem)] font-semibold tabular-nums tracking-tighter text-[var(--dm-accent)]">
                  {owedPreview}
                </p>
                <p className="mt-2 max-w-[20rem] text-xs font-medium leading-snug text-dm-muted">
                  Receipt intelligence lands in your feed · split arithmetic unlocks in
                  Pro. Owed states trend green · owe states bleed red here.
                </p>
              </div>
              <div className="flex flex-col gap-4 lg:items-end">
                <ContextualActionChip
                  householdsCount={households.length}
                  receiptsCountAllTime={realReceiptCount}
                  primaryHouseholdHasReceipts={firstHhReceipts > 0}
                  scanReceiptHref={scanHref}
                  createHouseholdHint={households.length === 0}
                />
                {scanHref ? (
                  <Link
                    href={scanHref}
                    className="inline-flex w-full justify-center rounded-none border-[3px] border-dm-accent bg-dm-accent px-8 py-4 text-center font-mono text-sm font-black uppercase tracking-wide text-dm-accent-ink shadow-[5px_5px_0_0_var(--dm-border-strong)] transition hover:-translate-y-px sm:w-auto lg:min-w-[14rem]"
                  >
                    Scan receipt · AI
                  </Link>
                ) : (
                  <button
                    type="button"
                    disabled
                    className="rounded-none border-[3px] border-dm-muted px-8 py-4 text-center font-mono text-sm font-black uppercase tracking-wide text-dm-muted opacity-60"
                  >
                    Anchor a dorm first
                  </button>
                )}
              </div>
            </div>
          </section>

          <section aria-labelledby="activity-feed">
            <div className="flex flex-wrap items-end justify-between gap-3 border-b-[3px] border-dm-electric pb-4">
              <div>
                <h2
                  id="activity-feed"
                  className="font-mono text-sm font-black uppercase tracking-[0.2em] text-dm-electric"
                >
                  The Feed
                </h2>
                <p className="mt-1 text-xs font-medium text-dm-muted">
                  Chronological dorm signal — receipts + roadmap teasers.
                </p>
              </div>
              {feedErr ? (
                <span className="text-[11px] font-bold uppercase tracking-wide text-dm-danger">
                  Feed degraded
                </span>
              ) : null}
            </div>
            <div className="mt-6">
              <DashboardFeed receipts={receiptFeed} />
            </div>
          </section>
        </div>

        <aside className="w-full shrink-0 space-y-6 xl:w-[min(100%,22rem)]">
          <div
            id="create-household"
            className="scroll-mt-28 border-[3px] border-dm-border-strong bg-dm-surface p-6 shadow-[5px_5px_0_0_var(--dm-electric)] lg:p-8"
          >
            <h3 className="font-mono text-xs font-black uppercase tracking-[0.22em] text-dm-muted">
              New dorm slug
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-dm-muted">
              Brutal naming. Shared cockpit for AI receipts, inventories, chores.
            </p>
            <CreateHouseholdForm className="mt-5 space-y-4" />
          </div>

          {households.length > 0 ? (
            <div className="border-[3px] border-dm-electric/35 bg-dm-elevated/80 p-5">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-dm-muted">
                Jump · spaces
              </p>
              <ul className="mt-4 space-y-3">
                {households.map((h) => (
                  <li key={h.id}>
                    <Link
                      href={`/dashboard/household/${h.id}`}
                      className="flex items-center justify-between gap-4 border-[3px] border-dm-surface bg-dm-surface px-4 py-3 font-semibold shadow-[4px_4px_0_0_var(--dm-border-strong)] transition hover:-translate-y-px hover:border-dm-electric"
                    >
                      <span className="truncate text-sm text-dm-text">{h.name}</span>
                      <span className="shrink-0 bg-dm-accent px-2 py-1 font-mono text-[10px] font-black uppercase text-dm-accent-ink">
                        {h.role}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </div>
    </div>
  );
}
