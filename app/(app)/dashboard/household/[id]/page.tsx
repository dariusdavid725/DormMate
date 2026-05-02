import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { RenameHouseholdForm } from "@/components/dashboard/rename-household-form";
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
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-zinc-500 dark:text-zinc-400">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/dashboard"
              className="font-medium text-zinc-600 hover:text-emerald-700 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
            >
              Overview
            </Link>
          </li>
          <li aria-hidden className="text-zinc-300 dark:text-zinc-600">
            /
          </li>
          <li className="truncate font-medium text-zinc-800 dark:text-zinc-200">
            {household.name}
          </li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-6 border-b border-zinc-200 pb-8 dark:border-zinc-800">
        <div className="min-w-0 max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700 dark:text-emerald-400">
            Household
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white md:text-[2rem]">
            {household.name}
          </h1>
          <p className="mt-3 text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400">
            Your role{" "}
            <span className="font-semibold capitalize text-zinc-800 dark:text-zinc-200">
              {memberRole}
            </span>
            . Created {formatDate(household.createdAt)}.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-2">
          <span className="inline-flex rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200">
            {households.length} space{households.length === 1 ? "" : "s"}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex rounded-full border border-zinc-300 bg-transparent px-3 py-1 text-xs font-semibold text-zinc-700 transition hover:bg-zinc-100 dark:border-zinc-600 dark:text-zinc-200 dark:hover:bg-zinc-800"
          >
            All households
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-2 border-b border-zinc-200 dark:border-zinc-800">
        <Link
          href={tabBase}
          scroll={false}
          className={[
            "rounded-t-lg px-4 py-2.5 text-sm font-semibold transition",
            view === "overview"
              ? "border border-b-0 border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
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
              ? "border border-b-0 border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
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
              ? "border border-b-0 border-zinc-200 bg-white text-zinc-900 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
              : "text-zinc-500 hover:text-zinc-800 dark:text-zinc-400 dark:hover:text-zinc-200",
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
              className="group flex flex-col rounded-3xl border border-teal-200/80 bg-gradient-to-br from-teal-50 via-white to-amber-50 p-6 shadow-sm ring-1 ring-teal-600/10 transition hover:shadow-md dark:border-teal-900/50 dark:from-teal-950/40 dark:via-stone-950 dark:to-amber-950/30 dark:ring-teal-400/15"
            >
              <span className="w-fit rounded-full bg-teal-600 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-white">
                Beta
              </span>
              <h2 className="mt-4 text-lg font-semibold text-stone-900 group-hover:text-teal-900 dark:text-stone-50 dark:group-hover:text-teal-200">
                Receipts & splits
              </h2>
              <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                Snap grocery runs — we read totals so nobody re-types chaos from a
                crumpled slip.
              </p>
              <span className="mt-5 inline-flex items-center gap-1 text-sm font-semibold text-teal-700 group-hover:gap-2 dark:text-teal-300">
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
                className="flex flex-col rounded-3xl border border-stone-200 bg-white/90 p-6 shadow-sm dark:border-stone-800 dark:bg-stone-950/50"
              >
                <span className="w-fit rounded-full bg-stone-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-stone-600 dark:bg-stone-800 dark:text-stone-400">
                  {card.status}
                </span>
                <h2 className="mt-4 text-base font-semibold text-stone-900 dark:text-stone-50">
                  {card.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {card.desc}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-12 rounded-3xl border border-stone-200 bg-white p-8 shadow-sm dark:border-stone-800 dark:bg-stone-950/35">
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              Settings
            </h2>
            <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
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
          <div className="overflow-hidden rounded-2xl border border-zinc-200 bg-white shadow-sm dark:border-zinc-800 dark:bg-zinc-900/40">
            <div className="border-b border-zinc-100 px-6 py-4 dark:border-zinc-800">
              <h2 className="font-semibold text-zinc-900 dark:text-white">
                Who&apos;s here
              </h2>
              <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                Members you share this household with — profiles and invitations
                will enrich this view next.
              </p>
            </div>
            {membersResult && "error" in membersResult ? (
              <p className="px-6 py-6 text-sm text-red-700 dark:text-red-300">
                Could not load members.{" "}
                {shouldExposeSupabaseError() ? (
                  <>
                    Run{" "}
                    <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                      supabase/schema.sql
                    </code>{" "}
                    in Supabase so{" "}
                    <code className="rounded bg-zinc-100 px-1 dark:bg-zinc-800">
                      list_household_members_for_user
                    </code>{" "}
                    exists.
                  </>
                ) : (
                  PUBLIC_TRY_AGAIN
                )}
              </p>
            ) : (
              <table className="min-w-full text-left text-sm">
                <thead className="bg-zinc-50 text-[11px] font-semibold uppercase tracking-[0.12em] text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400">
                  <tr>
                    <th scope="col" className="px-6 py-3">
                      Member
                    </th>
                    <th scope="col" className="px-6 py-3">
                      Role
                    </th>
                    <th scope="col" className="hidden px-6 py-3 sm:table-cell">
                      Joined
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {(membersResult as HouseholdMemberRow[]).map((m) => (
                    <tr key={m.userId} className="text-zinc-800 dark:text-zinc-100">
                      <td className="px-6 py-3.5 font-mono text-[13px]">
                        <span className="font-semibold tabular-nums">
                          {m.userId.slice(0, 8)}
                        </span>
                        <span className="text-zinc-400 dark:text-zinc-500">
                          …{m.userId.slice(-4)}
                        </span>
                        {m.userId === user.id ? (
                          <span className="ml-2 rounded-md bg-emerald-600/12 px-1.5 py-0.5 text-[11px] font-semibold uppercase text-emerald-900 dark:bg-emerald-500/15 dark:text-emerald-50">
                            You
                          </span>
                        ) : null}
                      </td>
                      <td className="px-6 py-3.5 capitalize">{m.role}</td>
                      <td className="hidden px-6 py-3.5 text-zinc-600 sm:table-cell dark:text-zinc-400">
                        {formatDate(m.joinedAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </section>
      ) : (
        <section className="mt-10 space-y-8">
          <ReceiptScannerPanel householdId={id} />
          <div>
            <h2 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
              Saved receipts
            </h2>
            <p className="mt-1 text-sm text-stone-600 dark:text-stone-400">
              Everyone in this household can see these — transparency beats awkward
              guessing about who paid what.
            </p>
            {receiptsPayload?.error ? (
              <p className="mt-4 text-sm text-rose-700 dark:text-rose-300">
                Could not load receipts. Run the latest{" "}
                <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">
                  supabase/schema.sql
                </code>{" "}
                so the{" "}
                <code className="rounded bg-stone-100 px-1 dark:bg-stone-800">
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
