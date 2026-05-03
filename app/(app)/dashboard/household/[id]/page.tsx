import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RenameHouseholdForm } from "@/components/dashboard/rename-household-form";
import { HouseholdMembersPanel } from "@/components/household/household-members-panel";
import { ReceiptList } from "@/components/receipts/receipt-list";
import { ReceiptScannerPanel } from "@/components/receipts/receipt-scanner-panel";
import { CreateHouseholdTaskForm } from "@/components/tasks/create-household-task-form";
import { HouseholdTaskList } from "@/components/tasks/household-task-list";
import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import type { HouseholdMemberRow } from "@/lib/households/queries";
import {
  loadHouseholdDetail,
  loadHouseholdMembers,
  loadHouseholdSummaries,
} from "@/lib/households/queries";
import { loadReceiptsForHousehold } from "@/lib/receipts/queries";
import { loadOpenTasksForHousehold } from "@/lib/tasks/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

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
  const view =
    rawView === "members"
      ? "members"
      : rawView === "receipts"
        ? "receipts"
        : rawView === "tasks"
          ? "tasks"
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

  const membersResult =
    view === "members" ? await loadHouseholdMembers(id) : null;

  const receiptsPayload =
    view === "receipts" ? await loadReceiptsForHousehold(id) : null;

  const tasksPayload =
    view === "tasks" ? await loadOpenTasksForHousehold(id) : null;

  const canRename = household.createdBy === user.id;

  const tabBase = `/dashboard/household/${id}`;

  return (
    <div className="mx-auto w-full max-w-6xl pb-28 lg:pb-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-dm-muted">
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

      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-[var(--dm-border-strong)] pb-8">
        <div className="min-w-0 max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
            Household
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-dm-text md:text-[2rem]">
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

      <div className="mt-8 flex gap-2 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] sm:overflow-visible sm:flex-wrap [&::-webkit-scrollbar]:hidden">
        <div className="flex min-w-0 shrink-0 gap-2 rounded-full bg-dm-surface/60 p-1 ring-1 ring-[var(--dm-border-strong)] backdrop-blur-sm">
        <Link
          href={tabBase}
          scroll={false}
          className={[
            "rounded-full px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap transition sm:min-w-[6.75rem]",
            view === "overview"
              ? "bg-[color-mix(in_srgb,var(--dm-electric)_15%,transparent)] text-dm-electric ring-1 ring-[var(--dm-border)]"
              : "text-dm-muted hover:text-dm-text",
          ].join(" ")}
        >
          Overview
        </Link>
        <Link
          href={`${tabBase}?view=tasks`}
          scroll={false}
          className={[
            "rounded-full px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap transition sm:min-w-[6.75rem]",
            view === "tasks"
              ? "bg-[color-mix(in_srgb,var(--dm-electric)_16%,transparent)] font-semibold text-dm-electric ring-1 ring-[var(--dm-border)]"
              : "text-dm-muted hover:text-dm-text",
          ].join(" ")}
        >
          Tasks
        </Link>
        <Link
          href={`${tabBase}?view=members`}
          scroll={false}
          className={[
            "rounded-full px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap transition sm:min-w-[6.75rem]",
            view === "members"
              ? "bg-[color-mix(in_srgb,var(--dm-electric)_15%,transparent)] text-dm-electric ring-1 ring-[var(--dm-border)]"
              : "text-dm-muted hover:text-dm-text",
          ].join(" ")}
        >
          Members
        </Link>
        <Link
          href={`${tabBase}?view=receipts`}
          scroll={false}
          className={[
            "rounded-full px-4 py-2.5 text-center text-sm font-semibold whitespace-nowrap transition sm:min-w-[6.75rem]",
            view === "receipts"
              ? "bg-[var(--dm-accent-soft)] text-[var(--dm-accent-ink)] ring-1 ring-emerald-400/30"
              : "text-dm-muted hover:text-dm-accent-ink",
          ].join(" ")}
        >
          Receipts
        </Link>
        </div>
      </div>

      {view === "overview" ? (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href={`${tabBase}?view=receipts`}
              scroll={false}
              className="flex flex-col rounded-3xl border border-[var(--dm-border-strong)] bg-gradient-to-b from-[var(--dm-accent-soft)] to-dm-surface/80 p-7 shadow-lg shadow-black/[0.04] transition hover:shadow-xl"
            >
              <span className="w-fit rounded-full bg-[var(--dm-accent)] px-3 py-1 text-[11px] font-semibold text-[var(--dm-accent-ink)]">
                AI scanning
              </span>
              <h2 className="mt-4 text-lg font-semibold tracking-tight text-dm-text">
                Receipts
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-dm-muted">
                Upload slips — we lift totals without retyping blurry photos.
              </p>
              <span className="mt-6 text-sm font-semibold text-dm-electric">
                Open receipts →
              </span>
            </Link>
            {[
              {
                title: "Pantry & staples",
                desc: "Shared TP, milk, spices — low-stock cues without passive aggression.",
                status: "Soon",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="flex flex-col rounded-3xl border border-[var(--dm-border)] bg-dm-surface/70 p-7 shadow-md shadow-black/[0.03]"
              >
                <span className="w-fit rounded-full bg-dm-bg px-3 py-0.5 text-[11px] font-semibold text-dm-muted">
                  {card.status}
                </span>
                <h2 className="mt-4 text-base font-semibold text-dm-text">
                  {card.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-dm-muted">
                  {card.desc}
                </p>
              </article>
            ))}
            <Link
              href={`${tabBase}?view=tasks`}
              scroll={false}
              className="flex flex-col rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/80 p-7 shadow-lg shadow-black/[0.05] transition hover:border-dm-electric/35"
            >
              <span className="inline-flex w-fit rounded-full bg-[color-mix(in_srgb,var(--dm-fun)_22%,transparent)] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-dm-text">
                Live
              </span>
              <h2 className="mt-4 text-lg font-bold tracking-tight text-dm-text">
                Chores & rewards
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-dm-muted">
                Post jobs, set points, let housemates claim wins — keep it light.
              </p>
              <span className="mt-6 text-sm font-semibold text-dm-electric">
                Open tasks →
              </span>
            </Link>
          </div>

          <section className="mt-12 rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/72 p-8 shadow-lg shadow-black/[0.04] backdrop-blur-sm">
            <h2 className="text-base font-semibold text-dm-text">
              Settings
            </h2>
            <p className="mt-2 text-sm text-dm-muted">
              {canRename
                ? "Rename is available to whoever created this household."
                : "Only the creator can rename this household. Ask them to adjust the display name."}
            </p>
            {canRename ? (
              <RenameHouseholdForm
                householdId={household.id}
                initialName={household.name}
              />
            ) : null}
          </section>
        </>
      ) : view === "tasks" ? (
        <section className="mt-10 space-y-10">
          {tasksPayload?.error ? (
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
          ) : (
            <>
              <div className="rounded-2xl border border-[var(--dm-border-strong)] border-l-[3px] border-l-dm-electric bg-dm-surface/80 p-6 shadow-inner sm:p-8">
                <h2 className="text-[11px] font-bold uppercase tracking-[0.22em] text-dm-electric">
                  New chore
                </h2>
                <CreateHouseholdTaskForm
                  className="mt-6 space-y-4"
                  households={[{ id: household.id, name: household.name }]}
                  fixedHouseholdId={id}
                />
              </div>
              <HouseholdTaskList tasks={tasksPayload?.tasks ?? []} />
            </>
          )}
        </section>
      ) : view === "members" ? (
        <section className="mt-10">
          {membersResult && "error" in membersResult ? (
            <div
              role="alert"
              className="rounded-2xl border border-dm-danger/35 bg-red-500/[0.05] px-5 py-4 text-sm text-dm-danger"
            >
              Could not load members.{" "}
              {shouldExposeSupabaseError() ? (
                <>
                  Apply{" "}
                  <code className="border border-dm-danger/40 px-1 font-mono normal-case">
                    schema.sql
                  </code>
                </>
              ) : (
                PUBLIC_TRY_AGAIN
              )}
            </div>
          ) : (
            <HouseholdMembersPanel
              members={membersResult as HouseholdMemberRow[]}
              currentUserId={user.id}
              householdId={id}
            />
          )}
        </section>
      ) : (
        <section className="mt-10 space-y-8">
          <ReceiptScannerPanel householdId={id} />
          <div>
            <h2 className="text-base font-semibold text-dm-text">
              Saved receipts
            </h2>
            <p className="mt-2 text-sm text-dm-muted">
              Everyone in this household can see these — transparency beats awkward
              guessing about who paid what.
            </p>
            {receiptsPayload?.error ? (
              <p className="mt-4 text-sm font-medium text-dm-danger">
                Couldn&apos;t load receipts · check the receipts table migration.
              </p>
            ) : (
              <div className="mt-6">
                <ReceiptList
                  receipts={receiptsPayload?.receipts ?? []}
                  emptyHint="No receipts saved yet — upload one above."
                />
              </div>
            )}
          </div>
        </section>
      )}
    </div>
  );
}
