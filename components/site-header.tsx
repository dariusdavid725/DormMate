import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

import { signOut } from "@/lib/auth/actions";

export async function SiteHeader() {
  let userEmail: string | null = null;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userEmail = user?.email ?? null;
  } catch {
    userEmail = null;
  }

  return (
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#faf8f5]/90 backdrop-blur-md dark:border-stone-800/90 dark:bg-stone-950/90">
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2.5 font-semibold tracking-tight text-stone-900 dark:text-white"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-xs font-bold text-white shadow-md shadow-teal-900/25 dark:shadow-black/40">
            DM
          </span>
          <span>DormMate</span>
        </Link>
        <nav
          aria-label="Main"
          className="hidden flex-1 justify-center md:flex md:gap-10"
        >
          <Link
            href="/#features"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-teal-800 dark:text-stone-400 dark:hover:text-teal-300"
          >
            Why it helps
          </Link>
          <Link
            href="/#how-it-works"
            className="text-sm font-medium text-stone-600 transition-colors hover:text-teal-800 dark:text-stone-400 dark:hover:text-teal-300"
          >
            How it works
          </Link>
        </nav>
        <div className="flex items-center gap-2 sm:gap-3">
          {userEmail ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-sm text-stone-600 dark:text-stone-400 sm:inline">
                {userEmail}
              </span>
              <Link
                href="/dashboard"
                className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-teal-500 hover:to-emerald-500"
              >
                Your space
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-2xl border border-stone-300 bg-white px-4 py-2 text-sm font-semibold text-stone-800 transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-2xl px-3 py-2 text-sm font-semibold text-stone-700 transition hover:text-teal-800 dark:text-stone-300 dark:hover:text-teal-300"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:from-teal-500 hover:to-emerald-500"
              >
                Get started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
