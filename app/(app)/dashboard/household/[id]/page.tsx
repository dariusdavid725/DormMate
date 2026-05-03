import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RenameHouseholdForm } from "@/components/dashboard/rename-household-form";
import { HouseholdMembersPanel } from "@/components/household/household-members-panel";
import { ReceiptList } from "@/components/receipts/receipt-list";
import { ReceiptScannerPanel } from "@/components/receipts/receipt-scanner-panel";
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

  const canRename = household.createdBy === user.id;

  const tabBase = `/dashboard/household/${id}`;

  return (
    <div className="mx-auto w-full max-w-6xl pb-16">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-stone-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/dashboard"
              className="font-medium text-stone-600 underline-offset-4 hover:text-teal-800 hover:underline"
            >
              Overview
            </Link>
          </li>
          <li aria-hidden className="text-stone-300">
            /
          </li>
          <li className="truncate font-medium text-stone-800">
            {household.name}
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-stone-200 pb-8">
        <div className="min-w-0 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-teal-800">
            Household
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900 md:text-[2rem]">
            {household.name}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-stone-600">
            Your role{" "}
            <span className="font-semibold capitalize text-stone-800">
              {memberRole}
            </span>
            . Created {formatDate(household.createdAt)}.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-stone-200 bg-white px-3 py-1 text-xs font-medium text-stone-700 shadow-sm">
            {households.length} space{households.length === 1 ? "" : "s"}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-stone-300 bg-transparent px-3 py-1 text-xs font-semibold text-stone-700 transition hover:bg-stone-100"
          >
            All households
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-stone-200">
        <Link
          href={tabBase}
          scroll={false}
          className={[
            "rounded-t-lg px-4 py-2.5 text-sm font-semibold transition",
            view === "overview"
              ? "border border-b-0 border-stone-200 bg-white text-stone-900 shadow-[0_-1px_0_0_white]"
              : "text-stone-500 hover:text-stone-800",
          ].join(" ")}
        >
          Overview
        </Link>
        <Link
          href={`${tabBase}?view=members`}
          scroll={false}
          className={[
            "rounded-t-lg px-4 py-2.5 text-sm font-semibold transition",
            view === "members"
              ? "border border-b-0 border-stone-200 bg-white text-stone-900 shadow-[0_-1px_0_0_white]"
              : "text-stone-500 hover:text-stone-800",
          ].join(" ")}
        >
          Members
        </Link>
        <Link
          href={`${tabBase}?view=receipts`}
          scroll={false}
          className={[
            "rounded-t-lg px-4 py-2.5 text-sm font-semibold transition",
            view === "receipts"
              ? "border border-b-0 border-stone-200 bg-white text-stone-900 shadow-[0_-1px_0_0_white]"
              : "text-stone-500 hover:text-stone-800",
          ].join(" ")}
        >
          Receipts
        </Link>
      </div>

      {view === "overview" ? (
        <>
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href={`${tabBase}?view=receipts`}
              scroll={false}
              className="group flex flex-col rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-50 via-white to-stone-50 p-6 shadow-sm ring-1 ring-teal-600/10 transition hover:shadow-md"
            >
              <span className="w-fit rounded-full bg-teal-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Beta
              </span>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 group-hover:text-teal-900">
                Receipts & splits
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                Snap grocery runs — we read totals so nobody re-types chaos from a
                crumpled slip.
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:gap-2">
                Open receipts tab
                <span aria-hidden>→</span>
              </span>
            </Link>
            {[
              {
                title: "Pantry & staples",
                desc: "Shared TP, milk, spices — low-stock cues without passive aggression.",
                status: "Soon",
              },
              {
                title: "Chores & quiet hours",
                desc: "Fair rotations and gentle signal when someone’s heads-down.",
                status: "Soon",
              },
            ].map((card) => (
              <article
                key={card.title}
                className="flex flex-col rounded-3xl border border-stone-200 bg-white p-6 shadow-sm"
              >
                <span className="w-fit rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600">
                  {card.status}
                </span>
                <h2 className="mt-4 text-base font-semibold text-stone-900">
                  {card.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600">
                  {card.desc}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-12 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm">
            <h2 className="text-lg font-semibold text-stone-900">
              Settings
            </h2>
            <p className="mt-2 text-sm text-stone-600">
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
      ) : view === "members" ? (
        <section className="mt-10">
          {membersResult && "error" in membersResult ? (
            <div
              role="alert"
              className="rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-900"
            >
              Could not load members.{" "}
              {shouldExposeSupabaseError() ? (
                <>
                  Run{" "}
                  <code className="rounded bg-red-100 px-1 font-mono text-xs">
                    supabase/schema.sql
                  </code>{" "}
                  in Supabase so{" "}
                  <code className="rounded bg-red-100 px-1 font-mono text-xs">
                    list_household_members_for_user
                  </code>{" "}
                  (with profiles) is applied.
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
            <h2 className="text-lg font-semibold text-stone-900">
              Saved receipts
            </h2>
            <p className="mt-1 text-sm text-stone-600">
              Everyone in this household can see these — transparency beats awkward
              guessing about who paid what.
            </p>
            {receiptsPayload?.error ? (
              <p className="mt-4 text-sm text-rose-700">
                Could not load receipts. Run the latest{" "}
                <code className="rounded bg-stone-100 px-1 font-mono text-xs">
                  supabase/schema.sql
                </code>{" "}
                so the{" "}
                <code className="rounded bg-stone-100 px-1 font-mono text-xs">
                  receipts
                </code>{" "}
                table exists.
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
