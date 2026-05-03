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
    <div className="mx-auto w-full max-w-6xl">
      <nav aria-label="Breadcrumb" className="mb-6 text-xs text-stone-500">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/dashboard"
              className="font-medium text-stone-600 underline-offset-4 hover:text-teal-800 hover:underline"
            >
              Overview
            </Link>
          </li>
          <li aria-hidden className="text-stone-300">
            /
          </li>
          <li className="font-medium text-stone-800">Platform admin</li>
        </ol>
      </nav>

      <header className="border-b border-stone-200 pb-8">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-stone-500">
          Operations
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-stone-900">
          Platform overview
        </h1>
        <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-stone-600">
          Read-only snapshot across households. Access is restricted to the
          platform administrator account.
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
            className="rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm"
          >
            <p className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {card.label}
            </p>
            <p className="mt-2 text-3xl font-semibold tabular-nums text-stone-900">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-stone-900">
          Recent households
        </h2>
        <p className="mt-1 text-sm text-stone-500">
          Newest first (max 20).
        </p>
        <div className="mt-6 overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="border-b border-stone-100 bg-stone-50 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
              <tr>
                <th className="px-5 py-3">Name</th>
                <th className="hidden px-5 py-3 sm:table-cell">Created</th>
                <th className="hidden px-5 py-3 lg:table-cell">Creator ID</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={3} className="px-5 py-8 text-center text-stone-500">
                    No households yet.
                  </td>
                </tr>
              ) : (
                rows.map((r) => (
                  <tr key={r.id} className="text-stone-800">
                    <td className="px-5 py-3">
                      <Link
                        href={`/dashboard/household/${r.id}`}
                        className="font-medium text-teal-800 underline-offset-2 hover:underline"
                      >
                        {r.name}
                      </Link>
                    </td>
                    <td className="hidden px-5 py-3 text-stone-600 sm:table-cell">
                      {formatTs(r.created_at)}
                    </td>
                    <td className="hidden font-mono text-xs text-stone-500 lg:table-cell">
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
