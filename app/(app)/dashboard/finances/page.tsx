import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { loadHouseholdSummaries } from "@/lib/households/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Finances",
};

export default async function FinancesPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/finances");
  }

  const { households, error } = await loadHouseholdSummaries(user.id);

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-24 lg:pb-9">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-6">
        <h1 className="font-cozy-display text-[2.35rem] text-dm-text leading-[1.1]">
          The money envelope
        </h1>
        <p className="mt-2 max-w-xl text-[13px] text-dm-muted">
          Balance preview per flat — splits on the roadmap.
        </p>
      </header>

      {error ? (
        <div className="rounded-lg border border-dm-danger/35 px-4 py-3 text-sm text-dm-danger">
          {error}
        </div>
      ) : null}

      <div className="cozy-receipt cozy-tilt-xs overflow-hidden rounded-[2px]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--dm-border-strong)] bg-dm-bg text-[11px] font-medium uppercase tracking-wide text-dm-muted">
            <tr>
              <th className="px-5 py-3.5">Household</th>
              <th className="px-5 py-3.5">Role</th>
              <th className="px-5 py-3.5 tabular-nums text-dm-text">Balance (preview)</th>
              <th className="hidden px-5 py-3.5 sm:table-cell">Next move</th>
            </tr>
          </thead>
          <tbody>
            {households.length === 0 ? (
              <tr>
                <td className="px-5 py-12 text-center text-dm-muted" colSpan={4}>
                  Add a household from{" "}
                  <Link className="text-dm-electric hover:underline" href="/dashboard">
                    Home
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              households.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-[var(--dm-border)] last:border-b-0 transition-colors hover:bg-[color-mix(in_srgb,var(--dm-surface-mid)_55%,transparent)]"
                >
                  <td className="px-5 py-3.5 font-medium text-dm-text">{h.name}</td>
                  <td className="px-5 py-3.5 text-dm-muted">{h.role}</td>
                  <td className="px-5 py-3.5 font-mono tabular-nums text-dm-text">
                    €0.00
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell">
                    <Link
                      className="text-sm text-dm-electric hover:underline"
                      href={`/dashboard/household/${h.id}?view=receipts`}
                    >
                      Receipts
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
