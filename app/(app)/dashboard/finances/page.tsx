import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { loadHouseholdExpenseBalances } from "@/lib/expenses/queries";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finances",
};

function fmtMoney(n: number) {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency: "EUR",
    }).format(n);
  } catch {
    return `€${n.toFixed(2)}`;
  }
}

export default async function FinancesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/finances");
  }

  const { households, error } = await loadHouseholdSummaries(user.id);

  const rows = await Promise.all(
    households.map(async (h) => {
      const balances = await loadHouseholdExpenseBalances(h.id);
      const mine = balances.balances.find((b) => b.userId === user.id);
      return {
        id: h.id,
        name: h.name,
        role: h.role,
        net: mine?.netAmount ?? 0,
        balanceError: balances.error,
      };
    }),
  );

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-24 lg:pb-9">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-6">
        <h1 className="font-cozy-display text-[2.35rem] text-dm-text leading-[1.1]">
          The money envelope
        </h1>
        <p className="mt-2 max-w-xl text-[13px] text-dm-muted">
          Net position from pending manual splits + automatic math on who fronted cash.
        </p>
      </header>

      {error ?
        <div className="rounded-lg border border-dm-danger/35 px-4 py-3 text-sm text-dm-danger">
          {error}
        </div>
      : null}

      <div className="cozy-receipt cozy-tilt-xs overflow-hidden rounded-[2px]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--dm-border-strong)] bg-dm-bg text-[11px] font-medium uppercase tracking-wide text-dm-muted">
            <tr>
              <th className="px-5 py-3.5">Household</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5 tabular-nums text-dm-text">Your net (pending)</th>
              <th className="hidden px-5 py-3.5 sm:table-cell">Drill in</th>
            </tr>
          </thead>
          <tbody>
            {households.length === 0 ?
              <tr>
                <td className="px-5 py-12 text-center text-dm-muted" colSpan={4}>
                  Add a household from{" "}
                  <Link className="text-dm-electric hover:underline" href="/dashboard">
                    Home
                  </Link>
                  .
                </td>
              </tr>
            : rows.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-[var(--dm-border)] last:border-b-0 transition-colors hover:bg-[color-mix(in_srgb,var(--dm-surface-mid)_55%,transparent)]"
                >
                  <td className="px-5 py-3.5 font-medium text-dm-text">{r.name}</td>
                  <td className="px-5 py-3.5 capitalize text-dm-muted">{r.role}</td>
                  <td className="px-5 py-3.5 font-mono tabular-nums text-dm-text">
                    {r.balanceError ?
                      <span className="text-dm-muted">Run schema</span>
                    : fmtMoney(r.net)}
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <Link
                      className="text-sm text-dm-electric hover:underline"
                      href={`/dashboard/household/${r.id}?view=expenses`}
                    >
                      Open ledger
                    </Link>
                  </td>
                </tr>
              ))
            }
          </tbody>
        </table>
      </div>

      <section className="cozy-note cozy-tilt-xs p-5 text-[13px] leading-relaxed text-dm-muted shadow-[var(--cozy-shadow-note)]">
        Receipt scans stay separate from splits for now — they still show inside each flat&apos;s Receipts tab while we wire storage cleanly.
      </section>
    </div>
  );
}
