import type { Metadata } from "next";
import { redirect } from "next/navigation";

import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Dashboard",
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

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-10 px-4 py-14 sm:px-6">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Your space
        </h1>
        <p className="mt-2 text-zinc-600 dark:text-zinc-400">
          Signed in as <span className="font-medium text-zinc-900 dark:text-zinc-200">{email}</span>
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-medium text-zinc-900 dark:text-white">
            Households
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Create or join a shared flat to track balances, chores, and supplies
            together. Coming soon.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex cursor-not-allowed rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700"
          >
            Create household
          </button>
        </div>
        <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="font-medium text-zinc-900 dark:text-white">Profile</h2>
          <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
            Configure display name and notification preferences soon.
          </p>
          <button
            type="button"
            disabled
            className="mt-4 inline-flex cursor-not-allowed rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-zinc-400 dark:border-zinc-700"
          >
            Edit profile
          </button>
        </div>
      </div>

      <p className="text-sm text-zinc-600 dark:text-zinc-400">
        Need help? Email support will be wired here once DormMate is in beta.{" "}
        <Link href="/" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Back to home
        </Link>
      </p>
    </div>
  );
}
