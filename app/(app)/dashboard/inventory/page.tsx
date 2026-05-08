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

  return (
    <div className="mx-auto max-w-xl space-y-7 lg:space-y-7">
      <header className="hidden border-b border-dashed border-[var(--dm-border-strong)] pb-6 lg:block">
        <h1 className="font-cozy-display text-[2.35rem] text-dm-text leading-[1.1]">
          Groceries
        </h1>
        <p className="mt-2 text-[13px] text-dm-muted">
          Shared shopping list for your current household.
        </p>
      </header>

      <header className="border-b border-[var(--dm-border-strong)] pb-4 lg:hidden">
        <h1 className="font-cozy-display text-[2rem] leading-tight text-dm-text">Groceries</h1>
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
        <form className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-3">
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
        <div className="cozy-note p-5 shadow-[var(--cozy-shadow-note)]">
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
        <HouseholdGroceryBoard
          householdId={selected.id}
          householdName={selected.name}
          items={groceries.items}
          members={memberRows}
        />
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
