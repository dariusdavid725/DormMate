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
    <header className="sticky top-0 z-40 border-b border-dashed border-[var(--dm-border-strong)] bg-dm-surface/95 shadow-[var(--cozy-shadow-paper)] backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="font-cozy-display text-2xl text-dm-text sm:text-[1.85rem]"
        >
          DormMate
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {userEmail ? (
            <>
              <span className="hidden max-w-[12rem] truncate text-xs text-dm-muted sm:inline">
                {userEmail}
              </span>
              <Link
                href="/dashboard"
                className="rounded-md bg-dm-electric px-4 py-2 text-xs font-semibold text-white shadow-[1px_2px_0_rgba(54,47,40,0.08)] hover:brightness-105"
              >
                Board
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-md border border-dashed border-[var(--dm-border-strong)] px-4 py-2 text-xs font-medium text-dm-muted hover:border-dm-electric hover:text-dm-text"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-md px-3 py-2 text-sm font-medium text-dm-muted hover:text-dm-text"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="rounded-md bg-dm-electric px-4 py-2 text-sm font-semibold text-white shadow-[var(--cozy-shadow-paper)] hover:brightness-105"
              >
                Start
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
