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
      <header className="dm-fade-in-up border-b border-[color-mix(in_srgb,var(--dm-accent)_28%,transparent)] pb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-dm-accent">
          Ledger · vibes loading
        </p>
        <h1 className="mt-1.5 text-[2.05rem] font-black tracking-tight text-dm-text">
          Money desk
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-dm-muted">
          Balances thicken when splits ship — meanwhile this grid is your Receipt Mission
          Control preview.
        </p>
      </header>

      {error ? (
        <div className="dm-fade-in-up rounded-2xl border border-dm-danger/40 bg-[color-mix(in_srgb,var(--dm-danger)_8%,transparent)] px-4 py-3 text-sm text-dm-danger">
          {error}
        </div>
      ) : null}

      <div className="dm-card-surface dm-fade-in-up overflow-hidden rounded-[1.35rem]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-[var(--dm-border-strong)] bg-[color-mix(in_srgb,var(--dm-surface-mid)_94%,transparent)] text-[11px] font-black uppercase tracking-[0.16em] text-dm-muted">
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
                  Ledger&apos;s dormant — carve a dorm from{" "}
                  <Link className="font-bold text-dm-electric underline" href="/dashboard">
                    Home
                  </Link>
                  {" "}and watch these rows wake up ✨
                </td>
              </tr>
            ) : (
              households.map((h) => (
                <tr
                  key={h.id}
                  className="border-b border-[var(--dm-border)] last:border-b-0 transition-colors hover:bg-[color-mix(in_srgb,var(--dm-surface-mid)_55%,transparent)]"
                >
                  <td className="px-5 py-4 font-bold text-dm-text">{h.name}</td>
                  <td className="px-5 py-4">
                    <span className="rounded-full bg-[var(--dm-accent-soft)] px-3 py-0.5 text-[11px] font-bold uppercase tracking-wide text-[var(--dm-accent-ink)] ring-1 ring-[color-mix(in_srgb,var(--dm-accent)_38%,transparent)]">
                      {h.role}
                    </span>
                  </td>
                  <td className="px-5 py-4 font-mono text-lg font-black tabular-nums text-dm-accent">
                    €0.00
                  </td>
                  <td className="hidden px-5 py-4 sm:table-cell">
                    <Link
                      className="text-sm font-bold text-dm-electric hover:underline"
                      href={`/dashboard/household/${h.id}?view=receipts`}
                    >
                      Dump receipts →
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
