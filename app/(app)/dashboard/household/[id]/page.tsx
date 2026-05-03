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
    <div className="mx-auto w-full max-w-6xl pb-28 lg:pb-16">
      <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[10px] font-black uppercase tracking-widest text-dm-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link
              href="/dashboard"
              className="text-dm-electric underline underline-offset-2"
            >
              Pulse
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li className="truncate text-dm-text">{household.name}</li>
        </ol>
      </nav>

      <div className="flex flex-wrap items-start justify-between gap-6 border-b-[3px] border-dm-electric pb-8">
        <div className="min-w-0 max-w-xl">
          <p className="font-mono text-[10px] font-black uppercase tracking-[0.26em] text-dm-muted">
            Dorm node
          </p>
          <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-dm-text md:text-[2rem]">
            {household.name}
          </h1>
          <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
            Role{" "}
            <span className="font-mono font-bold uppercase text-dm-text">
              {memberRole}
            </span>
            · since {formatDate(household.createdAt)}.
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap gap-3">
          <span className="inline-flex items-center border-[3px] border-dm-border-strong bg-dm-surface px-3 py-1.5 font-mono text-[10px] font-black uppercase text-dm-text shadow-[3px_3px_0_0_var(--dm-electric)]">
            {households.length} space{households.length === 1 ? "" : "s"}
          </span>
          <Link
            href="/dashboard"
            className="inline-flex items-center border-[3px] border-dm-muted/40 px-4 py-1.5 font-mono text-[10px] font-black uppercase tracking-wide text-dm-muted transition hover:border-dm-electric hover:text-dm-electric"
          >
            Pulse
          </Link>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap gap-3 border-b-[3px] border-dm-border-strong/35">
        <Link
          href={tabBase}
          scroll={false}
          className={[
            "border-[3px] px-4 py-2.5 font-mono text-[11px] font-black uppercase tracking-wide transition",
            view === "overview"
              ? "border-dm-electric bg-dm-electric text-white shadow-[4px_4px_0_0_var(--dm-border-strong)]"
              : "border-transparent bg-dm-bg text-dm-muted hover:border-dm-electric hover:text-dm-text",
          ].join(" ")}
        >
          Overview
        </Link>
        <Link
          href={`${tabBase}?view=members`}
          scroll={false}
          className={[
            "border-[3px] px-4 py-2.5 font-mono text-[11px] font-black uppercase tracking-wide transition",
            view === "members"
              ? "border-dm-electric bg-dm-electric text-white shadow-[4px_4px_0_0_var(--dm-border-strong)]"
              : "border-transparent bg-dm-bg text-dm-muted hover:border-dm-electric hover:text-dm-text",
          ].join(" ")}
        >
          Members
        </Link>
        <Link
          href={`${tabBase}?view=receipts`}
          scroll={false}
          className={[
            "border-[3px] px-4 py-2.5 font-mono text-[11px] font-black uppercase tracking-wide transition",
            view === "receipts"
              ? "border-dm-accent bg-dm-accent text-dm-accent-ink shadow-[4px_4px_0_0_var(--dm-border-strong)]"
              : "border-transparent bg-dm-bg text-dm-muted hover:border-dm-accent hover:text-dm-accent-ink",
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
              className="group flex flex-col border-[3px] border-dm-accent bg-[color-mix(in_srgb,var(--dm-accent)_12%,transparent)] p-7 shadow-[6px_6px_0_0_var(--dm-border-strong)] transition hover:-translate-y-px"
            >
              <span className="w-fit border-[3px] border-dm-accent-ink bg-dm-accent px-2.5 py-1 font-mono text-[10px] font-black uppercase text-dm-accent-ink">
                AI lane live
              </span>
              <h2 className="mt-5 text-lg font-black uppercase tracking-tight text-dm-text">
                Receipt blast
              </h2>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-dm-muted">
                Vision pipeline reads slips · assignments drop into mint success
                states.
              </p>
              <span className="mt-6 inline-flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-wide text-dm-accent-ink">
                Receipts cockpit
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
                className="flex flex-col border-[3px] border-dm-border-strong bg-dm-surface p-7 shadow-[5px_5px_0_0_var(--dm-electric)]"
              >
                <span className="w-fit border-[2px] border-dm-muted/50 px-2 py-0.5 font-mono text-[10px] font-black uppercase tracking-widest text-dm-muted">
                  {card.status}
                </span>
                <h2 className="mt-5 text-base font-black uppercase tracking-tight text-dm-text">
                  {card.title}
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-dm-muted">
                  {card.desc}
                </p>
              </article>
            ))}
          </div>

          <section className="mt-12 border-[3px] border-dm-electric bg-dm-surface p-8 shadow-[8px_8px_0_0_var(--dm-border-strong)]">
            <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-dm-muted">
              Node mutation
            </h2>
            <p className="mt-3 text-sm text-dm-muted">
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
              className="border-[3px] border-dm-danger bg-dm-elevated px-5 py-4 font-mono text-xs font-bold uppercase tracking-wide text-dm-danger"
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
            <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-dm-muted">
              Saved slips
            </h2>
            <p className="mt-2 text-sm text-dm-muted">
              Everyone in this household can see these — transparency beats awkward
              guessing about who paid what.
            </p>
            {receiptsPayload?.error ? (
              <p className="mt-4 font-mono text-xs font-bold uppercase tracking-wide text-dm-danger">
                Receipts table missing · run migration stack.
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
