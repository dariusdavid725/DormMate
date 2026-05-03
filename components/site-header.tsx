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
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#fafafa]/95 backdrop-blur-md dark:border-stone-800/90 dark:bg-stone-950/95">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="text-[15px] font-semibold tracking-tight text-stone-900 dark:text-stone-50"
        >
          DormMate
        </Link>
        <div className="flex items-center gap-1 sm:gap-2">
          {userEmail ? (
            <>
              <span className="hidden max-w-[11rem] truncate text-xs text-stone-500 dark:text-stone-400 sm:inline">
                {userEmail}
              </span>
              <Link
                href="/dashboard"
                className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
              >
                Workspace
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-lg border border-stone-300 bg-white px-3.5 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-teal-700 px-3.5 py-2 text-sm font-medium text-white transition hover:bg-teal-800"
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
