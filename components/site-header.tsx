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
    <header className="sticky top-0 z-40 border-b-[3px] border-dm-electric bg-dm-surface/90 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href="/"
          className="border-[3px] border-dm-electric px-3 py-1 font-mono text-[11px] font-black uppercase tracking-widest text-dm-text shadow-[3px_3px_0_0_var(--dm-border-strong)]"
        >
          DormMate
        </Link>
        <div className="flex items-center gap-2 sm:gap-3">
          {userEmail ? (
            <>
              <span className="hidden max-w-[12rem] truncate font-mono text-[10px] font-bold uppercase tracking-wide text-dm-muted sm:inline">
                {userEmail}
              </span>
              <Link
                href="/dashboard"
                className="border-[3px] border-dm-accent bg-dm-accent px-3.5 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-dm-accent-ink shadow-[3px_3px_0_0_var(--dm-border-strong)]"
              >
                Pulse
              </Link>
              <form action={signOut}>
                <button
                  type="submit"
                  className="border-[3px] border-dm-border-strong bg-dm-bg px-3 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-dm-text shadow-[3px_3px_0_0_var(--dm-electric)]"
                >
                  Exit
                </button>
              </form>
            </>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-none px-3 py-2 font-mono text-[10px] font-black uppercase tracking-widest text-dm-muted hover:text-dm-electric"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="border-[3px] border-dm-electric bg-dm-electric px-4 py-2 font-mono text-[10px] font-black uppercase tracking-wider text-white shadow-[3px_3px_0_0_var(--dm-border-strong)]"
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
