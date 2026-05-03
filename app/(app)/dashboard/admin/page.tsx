import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { isPlatformSuperAdmin } from "@/lib/platform-admin";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Admin",
};

function formatTs(iso: string | null) {
  if (!iso) return "—";
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user?.email || !isPlatformSuperAdmin(user.email)) {
    redirect("/dashboard");
  }

  const [{ count: householdCount }, { count: profileCount }, { count: receiptCount }] =
    await Promise.all([
      supabase.from("households").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("receipts").select("*", { count: "exact", head: true }),
    ]);

  const { data: recentHouseholds } = await supabase
    .from("households")
    .select("id, name, created_at, created_by")
    .order("created_at", { ascending: false })
    .limit(20);

  const rows =
    (recentHouseholds ?? []) as Array<{
      id: string;
      name: string;
      created_at: string;
      created_by: string;
    }>;

  return (
    <div className="mx-auto w-full max-w-6xl pb-[7rem] lg:pb-10">
      <nav aria-label="Breadcrumb" className="mb-6 text-sm text-dm-muted">
        <Link href="/dashboard" className="font-semibold hover:text-dm-electric">
          Pulse
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span className="text-dm-text">Admin</span>
      </nav>

      <header className="border-b border-[var(--dm-border-strong)] pb-8">
        <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
          Platform ops
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-dm-text">
          Overview
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dm-muted">
          Read-only roll-up across households · JWT-gated roster.
        </p>
      </header>

      <div className="mt-10 grid gap-5 sm:grid-cols-3">
        {[
          { label: "Households", value: householdCount ?? 0 },
          { label: "Profiles", value: profileCount ?? 0 },
          { label: "Receipts", value: receiptCount ?? 0 },
        ].map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/72 px-5 py-5 shadow-lg shadow-black/[0.04] backdrop-blur-sm"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
              {card.label}
            </p>
            <p className="mt-3 font-mono text-3xl font-semibold tabular-nums text-dm-text">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-dm-text">
          Recent households
        </h2>
        <div className="mt-6 overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/72 shadow-xl shadow-black/[0.04] backdrop-blur-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-[var(--dm-border-strong)] bg-dm-bg/60 text-xs font-semibold uppercase tracking-wide text-dm-muted">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="hidden px-5 py-3 sm:table-cell">Created</th>
                <th className="hidden px-5 py-3 lg:table-cell">Creator ID</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td className="px-5 py-10 text-center text-dm-muted" colSpan={3}>
                    Quiet launch — nobody anchored yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="border-b border-[var(--dm-border)] last:border-b-0">
                    <td className="px-5 py-4">
                      <Link
                        className="font-semibold text-dm-electric hover:underline"
                        href={`/dashboard/household/${r.id}`}
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-4 font-mono text-xs tabular-nums text-dm-muted sm:table-cell">
                      {formatTs(r.created_at)}
                    </td>
                    <td className="hidden max-w-[13rem] truncate px-5 py-4 font-mono text-[11px] text-dm-muted lg:table-cell">
                      {r.created_by}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
