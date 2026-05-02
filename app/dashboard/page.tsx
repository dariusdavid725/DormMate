import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Link from "next/link";

import { CreateHouseholdForm } from "@/components/dashboard/create-household-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
};

type MemberRow = {
  household_id: string;
  role: string;
  joined_at: string;
};
type HouseholdRow = {
  id: string;
  name: string;
  created_at: string;
};

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const email = user.email ?? "";

  const { data: memberRowsRaw, error: memErr } = await supabase
    .from("household_members")
    .select("household_id, role, joined_at")
    .eq("user_id", user.id)
    .order("joined_at", { ascending: false });

  let householdCards: Array<{
    household: HouseholdRow;
    role: string;
    joined_at: string;
  }> = [];

  const memberRows = (memberRowsRaw ?? []) as MemberRow[];

  if (!memErr && memberRows.length > 0) {
    const ids = [...new Set(memberRows.map((m) => m.household_id))];
    const { data: hhRaw, error: hhErr } = await supabase
      .from("households")
      .select("id, name, created_at")
      .in("id", ids);

    if (!hhErr && hhRaw) {
      const byId = new Map(
        (hhRaw as HouseholdRow[]).map((h) => [h.id, h] as const),
      );

      householdCards = memberRows
        .map((m) => {
          const h = byId.get(m.household_id);
          return h ? { household: h, role: m.role, joined_at: m.joined_at } : null;
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);
    }
  }

  const listError = memErr?.message;

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-14 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Your space
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Signed in as{" "}
          <span className="font-medium text-zinc-900 dark:text-zinc-200">
            {email}
          </span>
        </p>
      </div>

      {listError && (
        <div
          role="alert"
          className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100"
        >
          <p className="font-medium">Could not load households</p>
          <p className="mt-1 opacity-90">{listError}</p>
          <p className="mt-2 opacity-90">
            If tables are missing, run{" "}
            <code className="rounded bg-amber-200/70 px-1 text-xs dark:bg-amber-900/60">
              supabase/schema.sql
            </code>{" "}
            in the Supabase SQL Editor.
          </p>
        </div>
      )}

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-medium text-zinc-900 dark:text-white">
          Households
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
          Create a flat or dorm group. You&apos;ll invite roommates in a future
          update.
        </p>

        {householdCards.length > 0 && (
          <ul className="mt-6 space-y-3">
            {householdCards.map(({ household, role }) => (
              <li
                key={household.id}
                className="flex items-center justify-between gap-4 rounded-lg border border-zinc-100 bg-zinc-50 px-4 py-3 dark:border-zinc-800 dark:bg-zinc-950/50"
              >
                <div>
                  <p className="font-medium text-zinc-900 dark:text-white">
                    {household.name}
                  </p>
                  <p className="text-xs text-zinc-500 capitalize dark:text-zinc-400">
                    {role}
                  </p>
                </div>
                <span className="text-xs text-zinc-400">Active</span>
              </li>
            ))}
          </ul>
        )}

        <CreateHouseholdForm />
      </section>

      <section className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="font-medium text-zinc-900 dark:text-white">Profile</h2>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Display name and notifications will land here next.
        </p>
      </section>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        <Link
          href="/"
          className="font-medium text-emerald-700 hover:underline dark:text-emerald-400"
        >
          ← Back to home
        </Link>
      </p>
    </div>
  );
}
