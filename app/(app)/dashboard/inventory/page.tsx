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
    <div className="mx-auto max-w-2xl space-y-7 lg:max-w-6xl lg:space-y-7">
      <header className="dm-module dm-module-depth relative hidden overflow-hidden px-6 pb-6 pt-5 lg:block">
        <div className="absolute right-5 top-4 h-14 w-14 rounded-2xl border border-[var(--dm-border)] bg-[radial-gradient(circle_at_35%_35%,rgba(111,127,94,0.3),transparent_70%)]" aria-hidden />
        <div className="dm-chip">Grocery board</div>
        <h1 className="mt-3 text-[2rem] font-semibold leading-[1.1] tracking-tight text-dm-text">
          Groceries
        </h1>
        <p className="mt-2 text-[13px] text-dm-muted">
          Shared shopping with priority, assignment, and quick bought status.
        </p>
        {selected ? (
          <div className="mt-4 flex flex-wrap gap-2">
            <span className="dm-chip">{openCount} pending</span>
            <span className="dm-chip">{boughtCount} bought</span>
            <span className="dm-chip">{memberRows.length} shoppers</span>
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
        <form className="dm-module p-3">
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
        <div className="grid gap-4 lg:grid-cols-12">
          <div className="lg:col-span-8">
            <HouseholdGroceryBoard
              householdId={selected.id}
              householdName={selected.name}
              items={groceries.items}
              members={memberRows}
            />
          </div>
          <aside className="space-y-4 lg:col-span-4">
            <section className="dm-module dm-module-depth p-4">
              <h2 className="dm-section-heading">Shopping mode</h2>
              <p className="mt-2 text-[13px] text-dm-muted">
                Focus on pending items, mark bought quickly, and keep assignments visible while shopping.
              </p>
              <div className="mt-3 rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/35 px-3 py-2.5">
                <p className="text-[11px] uppercase tracking-wide text-dm-muted">Today</p>
                <p className="mt-1 text-sm font-semibold text-dm-text">{openCount} items still needed</p>
              </div>
            </section>
            <section className="dm-module p-4">
              <h2 className="dm-section-heading">Receipt flow</h2>
              <p className="mt-2 text-[13px] text-dm-muted">
                After shopping, scan receipt in your home and turn it into a split from Money.
              </p>
              <div className="mt-3 flex gap-2">
                <Link href={`/dashboard/household/${selected.id}?view=receipts`} className="rounded-lg border border-[var(--dm-border-strong)] px-3 py-2 text-xs font-semibold text-dm-text hover:border-dm-electric hover:text-dm-electric">
                  Scan receipt
                </Link>
                <Link href={`/dashboard/household/${selected.id}?view=expenses`} className="rounded-lg border border-[var(--dm-border-strong)] px-3 py-2 text-xs font-semibold text-dm-text hover:border-dm-electric hover:text-dm-electric">
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
