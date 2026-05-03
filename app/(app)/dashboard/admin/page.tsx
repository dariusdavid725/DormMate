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
      <nav aria-label="Breadcrumb" className="mb-6 font-mono text-[10px] font-black uppercase tracking-widest text-dm-muted">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/dashboard" className="text-dm-electric underline">
              Pulse
            </Link>
          </li>
          <li aria-hidden className="opacity-40">
            /
          </li>
          <li className="text-dm-text">God mode</li>
        </ol>
      </nav>

      <header className="border-b-[3px] border-dm-electric pb-8">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-dm-muted">
          Operations telemetry
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-dm-text">
          Platform radar
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-dm-muted">
          Read-only across households · restricted JWT lane.
        </p>
      </header>

      <div className="mt-10 grid gap-4 sm:grid-cols-3">
        {[
          { label: "Households", value: householdCount ?? 0 },
          { label: "Profiles", value: profileCount ?? 0 },
          { label: "Receipts stored", value: receiptCount ?? 0 },
        ].map((card) => (
          <div
            key={card.label}
            className="border-[3px] border-dm-border-strong bg-dm-surface px-5 py-5 shadow-[5px_5px_0_0_var(--dm-electric)]"
          >
            <p className="font-mono text-[10px] font-black uppercase tracking-widest text-dm-muted">
              {card.label}
            </p>
            <p className="mt-3 font-mono text-4xl font-semibold tabular-nums tracking-tighter text-dm-text">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="font-mono text-[11px] font-black uppercase tracking-[0.2em] text-dm-muted">
          Recent households · max 20
        </h2>
        <div className="mt-6 overflow-hidden border-[3px] border-dm-border-strong bg-dm-surface shadow-[8px_8px_0_0_var(--dm-electric)]">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b-[3px] border-dm-electric bg-dm-elevated font-mono text-[10px] font-black uppercase tracking-widest text-dm-muted">
              <tr>
                <th className="px-5 py-3">Slug</th>
                <th className="hidden px-5 py-3 sm:table-cell">Created</th>
                <th className="hidden px-5 py-3 lg:table-cell">Creator UUID</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-10 text-center font-mono text-xs text-dm-muted">
                    No households yet · quiet grid.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b-[3px] border-dm-border-strong/25 last:border-b-0 text-dm-text"
                  >
                    <td className="px-5 py-4">
                      <Link
                        href={`/dashboard/household/${r.id}`}
                        className="font-semibold text-dm-electric underline underline-offset-2 hover:text-dm-accent"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-4 font-mono text-xs tabular-nums text-dm-muted sm:table-cell">
                      {formatTs(r.created_at)}
                    </td>
                    <td className="hidden max-w-[12rem] truncate px-5 py-4 font-mono text-[11px] text-dm-muted lg:table-cell">
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
