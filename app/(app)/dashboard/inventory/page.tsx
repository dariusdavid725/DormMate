import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { HouseholdGroceryBoard } from "@/components/groceries/household-grocery-board";
import { loadGroceriesForHousehold } from "@/lib/groceries/queries";
import { loadHouseholdMembers, loadHouseholdSummaries } from "@/lib/households/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Groceries",
};

type Props = {
  searchParams?: Promise<{ household?: string }>;
};

export default async function InventoryPage({ searchParams }: Props) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/inventory");
  }

  const q = searchParams ? await searchParams : {};
  const selectedHouseholdRaw = typeof q?.household === "string" ? q.household : "";
  const { households, error: hhError } = await loadHouseholdSummaries(user.id);
  const selected =
    households.find((h) => h.id === selectedHouseholdRaw) ?? households[0] ?? null;

  const groceries = selected
    ? await loadGroceriesForHousehold(selected.id)
    : { error: null as string | null, items: [] };
  const members = selected ? await loadHouseholdMembers(selected.id) : [];
  const memberRows = Array.isArray(members) ? members : [];

  const openCount = groceries.items.filter((g) => !g.bought).length;
  const boughtCount = groceries.items.length - openCount;

  return (
    <div className="dm-page-enter mx-auto max-w-2xl space-y-7 lg:max-w-6xl lg:space-y-7">
      <header className="dm-pantry-page-hero dm-module-depth relative hidden overflow-hidden px-6 pb-8 pt-7 lg:block lg:px-10 lg:pb-9 lg:pt-8">
        <span
          className="pointer-events-none absolute right-[12%] top-6 h-28 w-28 rounded-full bg-[radial-gradient(circle_at_35%_35%,rgba(239,201,125,0.34),transparent_72%)] blur-[1px]"
          aria-hidden
        />
        <span
          className="pointer-events-none absolute bottom-2 left-8 h-14 w-36 -rotate-6 rounded-full border border-dashed border-[color-mix(in_srgb,var(--dm-accent)_35%,transparent)] opacity-70"
          aria-hidden
        />
        <div className="relative flex flex-wrap items-center gap-2">
          <span className="dm-chip border-[color-mix(in_srgb,var(--dm-accent)_32%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-accent)_10%,white)]">
            Pantry board
          </span>
          <span className="dm-chip">Roommate-run list</span>
        </div>
        <h1 className="relative mt-4 text-[2.15rem] font-semibold leading-[1.06] tracking-tight text-dm-text lg:text-[2.65rem]">
          Groceries worth sharing
        </h1>
        <p className="relative mt-3 max-w-2xl text-[15px] leading-relaxed text-dm-muted">
          One running list for whoever hits the store—priorities, assignments, and “got it” taps without the group chat noise.
        </p>
        {selected ? (
          <div className="relative mt-5 flex flex-wrap gap-2">
            <span className="dm-chip border-[color-mix(in_srgb,var(--dm-electric)_26%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-electric)_9%,white)]">
              {openCount} still needed
            </span>
            <span className="dm-chip">{boughtCount} crossed off</span>
            <span className="dm-chip border-[color-mix(in_srgb,var(--dm-highlight)_30%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-highlight)_12%,white)]">
              {memberRows.length} shoppers
            </span>
          </div>
        ) : null}
      </header>

      <header className="border-b border-[var(--dm-border-strong)] pb-4 lg:hidden">
        <h1 className="text-[1.8rem] font-semibold leading-tight tracking-tight text-dm-text">Groceries</h1>
        <p className="mt-2 text-[14px] leading-snug text-dm-muted">
          Add items, assign them, and mark bought.
        </p>
      </header>

      {hhError ? (
        <p className="rounded-md border border-dm-danger/35 px-3 py-2 text-sm text-dm-danger">
          Could not load households.
        </p>
      ) : null}

      {households.length > 1 ? (
        <form className="dm-module-muted dm-module dm-module-depth rounded-[16px] border border-[color-mix(in_srgb,var(--dm-accent)_14%,var(--dm-border-strong))] p-4 shadow-[0_10px_24px_rgba(28,39,56,0.06)]">
          <label className="text-xs font-semibold uppercase tracking-wide text-dm-muted" htmlFor="inv-household">
            Household
          </label>
          <select
            id="inv-household"
            name="household"
            defaultValue={selected?.id ?? ""}
            className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm"
          >
            {households.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="mt-3 rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-xs font-semibold text-dm-text"
          >
            Switch household
          </button>
        </form>
      ) : null}

      {!selected ? (
        <div className="dm-module p-5">
          <p className="text-sm text-dm-muted">
            Join or create a household first from{" "}
            <Link href="/dashboard" className="font-semibold text-dm-electric hover:underline">
              Home
            </Link>
            .
          </p>
        </div>
      ) : groceries.error ? (
        <p className="rounded-md border border-dm-danger/35 px-3 py-2 text-sm text-dm-danger">
          Could not load groceries.
        </p>
      ) : (
        <div className="grid gap-5 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <HouseholdGroceryBoard
              householdId={selected.id}
              householdName={selected.name}
              items={groceries.items}
              members={memberRows}
            />
          </div>
          <aside className="space-y-4 lg:col-span-4">
            <section className="dm-pantry-side-note relative overflow-hidden p-5">
              <span
                className="pointer-events-none absolute -right-6 top-4 text-[4.5rem] font-light leading-none text-[color-mix(in_srgb,var(--dm-accent)_12%,transparent)]"
                aria-hidden
              >
                ✓
              </span>
              <h2 className="dm-section-heading relative">Run the list</h2>
              <p className="relative mt-2 text-[13px] leading-relaxed text-dm-muted">
                Keep pending items up top, tap bought on the go, and glance who claimed what before you checkout.
              </p>
              <div className="relative mt-4 rounded-[14px] border border-dashed border-[color-mix(in_srgb,var(--dm-accent)_35%,var(--dm-border-strong))] bg-white/70 px-3.5 py-3">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">Cart check</p>
                <p className="mt-1 text-base font-semibold text-dm-text">{openCount} items still needed</p>
              </div>
            </section>
            <section className="rounded-[16px] border border-[var(--dm-border-strong)] bg-[linear-gradient(185deg,#fffefb_0%,#f3f6f4_100%)] p-5 shadow-[0_12px_26px_rgba(28,39,56,0.06)]">
              <h2 className="dm-section-heading">After the store</h2>
              <p className="mt-2 text-[13px] leading-relaxed text-dm-muted">
                Drop the receipt into your home and spin up a split so nobody has to math in the hallway.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                <Link
                  href={`/dashboard/household/${selected.id}?view=receipts`}
                  className="dm-interactive dm-focus-ring rounded-full border border-[color-mix(in_srgb,var(--dm-electric)_38%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-electric)_10%,white)] px-3.5 py-2 text-xs font-semibold text-[var(--dm-electric-deep)]"
                >
                  Scan receipt
                </Link>
                <Link
                  href={`/dashboard/household/${selected.id}?view=expenses`}
                  className="dm-interactive dm-focus-ring rounded-full border border-[var(--dm-border-strong)] bg-white/80 px-3.5 py-2 text-xs font-semibold text-dm-text hover:border-dm-electric"
                >
                  Open money
                </Link>
              </div>
            </section>
          </aside>
        </div>
      )}

      <div className="hidden lg:block">
        <Link
          href="/dashboard"
          className="mt-6 inline-flex text-sm font-bold text-dm-electric underline decoration-dm-electric/45 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40"
        >
          ← Back to HQ
        </Link>
      </div>

    </div>
  );
}
