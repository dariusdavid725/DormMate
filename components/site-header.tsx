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
    <header className="sticky top-0 z-40 border-b border-[var(--dm-border-strong)] bg-dm-surface/90 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="text-[17px] font-semibold tracking-tight text-dm-text transition hover:text-dm-electric"
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
                className="dm-scan-hero rounded-full px-4 py-2 text-xs font-black text-[#071018] transition hover:brightness-110"
              >
                Dashboard
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="rounded-full border border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-muted transition hover:bg-dm-surface hover:text-dm-text"
                >
                  Sign out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-3 py-2 text-sm font-semibold text-dm-muted hover:text-dm-text"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="dm-scan-hero rounded-full px-4 py-2 text-sm font-black text-[#071018] shadow-sm transition hover:brightness-110"
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
