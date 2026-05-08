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
    <header className="sticky top-0 z-40 border-b border-dashed border-[var(--dm-border-strong)] bg-dm-surface/95 pt-[env(safe-area-inset-top)] shadow-[var(--cozy-shadow-paper)] backdrop-blur-sm">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 font-cozy-display text-2xl text-dm-text sm:text-[1.85rem]"
        >
          {/* eslint-disable-next-line @next/next/no-img-element -- static public brand logo */}
          <img src="/logo.png" alt="" className="h-8 w-8 rounded-md object-cover" aria-hidden />
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
                className="touch-manipulation inline-flex min-h-[44px] items-center justify-center rounded-md bg-dm-electric px-4 py-2 text-xs font-semibold text-white shadow-[1px_2px_0_rgba(54,47,40,0.08)] hover:brightness-105 sm:min-h-0"
              >
                Board
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="touch-manipulation min-h-[44px] rounded-md border border-dashed border-[var(--dm-border-strong)] px-4 py-2 text-xs font-medium text-dm-muted hover:border-dm-electric hover:text-dm-text sm:min-h-0"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="touch-manipulation inline-flex min-h-[44px] items-center rounded-md px-3 py-2 text-sm font-medium text-dm-muted hover:text-dm-text sm:min-h-0"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="touch-manipulation inline-flex min-h-[44px] items-center justify-center rounded-md bg-dm-electric px-4 py-2 text-sm font-semibold text-white shadow-[var(--cozy-shadow-paper)] hover:brightness-105 sm:min-h-0"
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
