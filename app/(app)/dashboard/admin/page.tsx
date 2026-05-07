import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import {
  addPlatformAdminEmail,
  removePlatformAdminEmail,
} from "@/lib/admin/actions";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Site admin",
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

  const { data: adminFlag } = await supabase.rpc("is_platform_super_admin");
  if (!user?.email || adminFlag !== true) {
    redirect("/dashboard");
  }

  const [{ count: householdCount }, { count: profileCount }, { count: receiptCount }] =
    await Promise.all([
      supabase.from("households").select("*", { count: "exact", head: true }),
      supabase.from("profiles").select("*", { count: "exact", head: true }),
      supabase.from("receipts").select("*", { count: "exact", head: true }),
    ]);

  const { data: adminRowsRaw } = await supabase.rpc("list_platform_admin_emails");
  const adminRows = (adminRowsRaw ?? []) as Array<{ email: string; added_at: string }>;

  const { data: usersRaw } = await supabase.rpc("list_platform_users");
  const users = (usersRaw ?? []) as Array<{
    user_id: string;
    email: string;
    display_name: string | null;
    created_at: string;
    household_count: number;
  }>;

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
          Home
        </Link>
        <span className="mx-2 opacity-40">/</span>
        <span className="text-dm-text">Site admin</span>
      </nav>

      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-6">
        <h1 className="text-3xl font-semibold tracking-tight text-dm-text">
          Site admin panel
        </h1>
        <p className="mt-2 text-[13px] text-dm-muted">
          Manage platform admins, review users, and inspect households.
        </p>
      </header>

      <div className="mt-8 grid gap-3 sm:grid-cols-3">
        {[
          { label: "Households", value: householdCount ?? 0, tilt: "cozy-tilt-xs" },
          {
            label: "Profiles",
            value: profileCount ?? 0,
            tilt: "cozy-tilt-xs-alt",
          },
          {
            label: "Receipts",
            value: receiptCount ?? 0,
            tilt: "cozy-tilt-xs",
          },
        ].map((card) => (
          <div
            key={card.label}
            className={`dm-card-surface ${card.tilt} px-4 py-4`}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
              {card.label}
            </p>
            <p className="mt-2 font-mono text-2xl font-semibold tabular-nums text-dm-text">
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <section className="mt-10 grid gap-5 lg:grid-cols-2">
        <div className="dm-card-surface p-5">
          <h2 className="text-lg font-semibold text-dm-text">Platform admins</h2>
          <p className="mt-1 text-[12px] text-dm-muted">
            Anyone listed here gets access to this panel.
          </p>
          <form action={addPlatformAdminEmail} className="mt-4 flex gap-2">
            <input
              type="email"
              name="email"
              required
              placeholder="admin@email.com"
              className="min-w-0 flex-1 rounded-md border border-[var(--dm-border-strong)] bg-dm-bg px-3 py-2 text-sm"
            />
            <button className="rounded-md bg-dm-electric px-3 py-2 text-sm font-semibold text-white">
              Add
            </button>
          </form>
          <ul className="mt-4 space-y-2">
            {adminRows.map((a) => (
              <li key={a.email} className="flex items-center justify-between gap-3 rounded-md border border-[var(--dm-border)] px-3 py-2">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-dm-text">{a.email}</p>
                  <p className="text-[11px] text-dm-muted">{formatTs(a.added_at)}</p>
                </div>
                {a.email.toLowerCase() !== "dariusdavid725@gmail.com" ? (
                  <form action={removePlatformAdminEmail}>
                    <input type="hidden" name="email" value={a.email} />
                    <button className="text-xs font-semibold text-dm-danger hover:underline">
                      Remove
                    </button>
                  </form>
                ) : null}
              </li>
            ))}
          </ul>
        </div>

        <div className="dm-card-surface p-5">
          <h2 className="text-lg font-semibold text-dm-text">Users</h2>
          <p className="mt-1 text-[12px] text-dm-muted">
            Latest 300 accounts, with household membership count.
          </p>
          <div className="mt-4 max-h-80 overflow-auto rounded-md border border-[var(--dm-border)]">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-[var(--dm-border)] bg-dm-bg/60 text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
                <tr>
                  <th className="px-3 py-2">User</th>
                  <th className="px-3 py-2">Joined</th>
                  <th className="px-3 py-2 text-right">Households</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.user_id} className="border-b border-[var(--dm-border)] last:border-b-0">
                    <td className="px-3 py-2">
                      <p className="truncate text-sm text-dm-text">{u.display_name ?? "—"}</p>
                      <p className="truncate text-[11px] text-dm-muted">{u.email}</p>
                    </td>
                    <td className="px-3 py-2 text-[11px] text-dm-muted">{formatTs(u.created_at)}</td>
                    <td className="px-3 py-2 text-right font-mono text-sm tabular-nums text-dm-text">
                      {u.household_count}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="mt-12">
        <h2 className="text-lg font-semibold text-dm-text">
          Recent households
        </h2>
        <div className="cozy-receipt cozy-tilt-xs mt-6 overflow-hidden rounded-[2px]">
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
