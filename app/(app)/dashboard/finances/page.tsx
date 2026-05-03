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
      <header className="border-b-[3px] border-dm-electric pb-6">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-dm-muted">
          ledger · brutal table
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-dm-text">
          Finances
        </h1>
        <p className="mt-2 max-w-xl text-sm text-dm-muted">
          Dense grid for shared exposure — attribution matrix ships with Pro parity.
          Mobile swipe columns next.
        </p>
      </header>

      {error ? (
        <div className="border-[3px] border-dm-danger px-4 py-3 text-sm font-bold text-dm-danger">
          {error}
        </div>
      ) : null}

      <div className="overflow-x-auto border-[3px] border-dm-border-strong bg-dm-surface shadow-[6px_6px_0_0_var(--dm-electric)]">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b-[3px] border-dm-electric bg-dm-elevated font-mono text-[10px] font-black uppercase tracking-widest text-dm-muted">
            <tr>
              <th className="px-4 py-3">Household</th>
              <th className="px-4 py-3">Role</th>
              <th className="px-4 py-3 tabular-nums">Net owed (β)</th>
              <th className="hidden px-4 py-3 sm:table-cell">Action</th>
            </tr>
          </thead>
          <tbody>
            {households.length === 0 ? (
              <tr>
                <td
                  className="px-4 py-10 text-center text-dm-muted"
                  colSpan={4}
                >
                  Anchor a dorm on{" "}
                  <Link href="/dashboard" className="text-dm-electric underline">
                    Pulse
                  </Link>
                  .
                </td>
              </tr>
            ) : (
              households.map((h) => (
                <tr
                  key={h.id}
                  className="border-b-[3px] border-dm-border-strong/15 last:border-b-0"
                >
                  <td className="px-4 py-4 font-semibold text-dm-text">{h.name}</td>
                  <td className="px-4 py-4">
                    <span className="inline-block border-[3px] border-dm-accent bg-dm-accent px-2 py-1 font-mono text-[10px] font-black uppercase text-dm-accent-ink">
                      {h.role}
                    </span>
                  </td>
                  <td className="px-4 py-4 font-mono text-lg tabular-nums text-dm-muted">
                    €0.00
                  </td>
                  <td className="hidden px-4 py-4 sm:table-cell">
                    <Link
                      href={`/dashboard/household/${h.id}?view=receipts`}
                      className="font-mono text-[11px] font-black uppercase text-dm-electric underline"
                    >
                      Scan lane
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
