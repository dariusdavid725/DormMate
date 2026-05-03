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
    <div className="mx-auto w-full max-w-4xl space-y-8 pb-[7rem] lg:pb-10">
      <header className="border-b border-[var(--dm-border-strong)] pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
          Ledger overview
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-dm-text">
          Finances
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-dm-muted">
          Dense totals when attribution ships — placeholder grid for now so navigation already feels purposeful.
        </p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-dm-danger/30 bg-red-500/[0.05] px-4 py-3 text-sm text-dm-danger">
          {error}
        </div>
      ) : null}

      <div className="overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/72 shadow-xl shadow-black/[0.04] backdrop-blur-sm">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--dm-border-strong)] bg-dm-bg/65 text-xs font-semibold uppercase tracking-wide text-dm-muted">
            <tr>
              <th className="px-5 py-3">Household</th>
              <th className="px-5 py-3">Role</th>
              <th className="px-5 py-3 tabular-nums">Balance (preview)</th>
              <th className="hidden px-5 py-3 sm:table-cell">Next step</th>
            </tr>
          </thead>
          <tbody>
            {households.length === 0 ? (
              <tr>
                <td className="px-5 py-12 text-center text-dm-muted" colSpan={4}>
                  Anchor a dorm from{" "}
                  <Link className="font-semibold text-dm-electric" href="/dashboard">
                    Home
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              households.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-[var(--dm-border)] last:border-b-0"
                >
                  <td className="px-5 py-4 font-medium text-dm-text">{h.name}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[var(--dm-accent-soft)] px-3 py-0.5 text-[11px] font-semibold text-dm-accent-ink">
                      {h.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-lg tabular-nums text-dm-muted">
                    €0.00
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <Link
                      className="text-sm font-semibold text-dm-electric hover:underline"
                      href={`/dashboard/household/${h.id}?view=receipts`}
                    >
                      Add receipts
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
