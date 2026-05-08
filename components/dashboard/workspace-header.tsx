import Link from "next/link";

import { signOut } from "@/lib/auth/actions";

type Props = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  showAdmin?: boolean;
  households?: Array<{ id: string; name: string; role: string }>;
};

function initialsFromIdentity(email: string, displayName?: string | null) {
  const base = displayName?.trim() || email.split("@")[0] || "?";
  return base.slice(0, 2).toUpperCase();
}

export function WorkspaceHeader({ email, displayName, avatarUrl, showAdmin, households = [] }: Props) {
  const initials = initialsFromIdentity(email, displayName);
  const profileLabel = displayName?.trim() || email;

  return (
    <header className="dm-topbar-shell sticky top-0 z-40 border-b border-[var(--dm-border-strong)] pt-[env(safe-area-inset-top)] shadow-[0_6px_16px_rgba(28,39,56,0.07)] backdrop-blur-md">
      <div className="mx-auto flex h-[52px] w-full max-w-[1260px] items-center gap-3 px-4 lg:h-14 lg:gap-4 lg:px-7">
        <div className="flex shrink-0 items-center gap-2 lg:gap-3">
          <Link
            href="/dashboard"
            className="dm-interactive dm-focus-ring inline-flex items-center gap-2 rounded-xl border border-[var(--dm-border)] bg-dm-surface px-2 py-1.5 text-[15px] font-semibold text-dm-text shadow-sm lg:px-2.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public brand logo */}
            <img src="/logo.png" alt="" className="h-7 w-7 rounded-lg object-cover lg:h-8 lg:w-8" aria-hidden />
            <span className="hidden sm:inline">Koti</span>
          </Link>
          <Link
            href="/dashboard/join"
            className="dm-interactive dm-focus-ring hidden rounded-lg border border-dashed border-[var(--dm-border-strong)] px-2 py-1.5 text-[11px] font-semibold text-dm-muted transition-colors hover:border-dm-electric hover:text-dm-text sm:inline-flex"
          >
            Join home
          </Link>
        </div>

        {households.length > 0 ? (
          <div
            className="hidden min-h-0 min-w-0 flex-1 items-center gap-2 lg:flex"
            role="navigation"
            aria-label="Quick switch homes"
          >
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-[0.12em] text-dm-muted">
              Homes
            </span>
            <div className="dm-topbar-homes-scroll flex min-w-0 flex-1 items-center gap-1.5 overflow-x-auto pb-0.5 [scrollbar-width:thin]">
              {households.slice(0, 12).map((h) => (
                <Link
                  key={h.id}
                  href={`/dashboard/household/${h.id}`}
                  className="dm-interactive dm-focus-ring inline-flex shrink-0 items-center gap-1.5 rounded-full border border-[var(--dm-border-strong)] bg-dm-surface/90 px-2.5 py-1 text-[11px] font-medium text-dm-muted shadow-sm transition-colors hover:border-[color-mix(in_srgb,var(--dm-electric)_45%,var(--dm-border-strong))] hover:text-dm-text"
                >
                  <span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-[color-mix(in_srgb,var(--dm-accent-soft)_100%,transparent)] text-[9px] font-bold text-[var(--dm-electric-deep)]">
                    {h.name.slice(0, 1).toUpperCase()}
                  </span>
                  <span className="max-w-[7.5rem] truncate">{h.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div className="hidden min-w-0 flex-1 lg:block" aria-hidden />
        )}

        <div className="flex shrink-0 items-center gap-1.5 lg:gap-2">
          {showAdmin ? (
            <Link
              href="/dashboard/admin"
              className="dm-interactive dm-focus-ring hidden rounded-md px-2 py-1 text-[11px] font-semibold text-dm-electric hover:underline sm:inline"
            >
              Admin
            </Link>
          ) : null}
          <Link
            href="/dashboard/settings"
            className="dm-interactive dm-focus-ring rounded-md px-2 py-1 text-[11px] font-semibold text-dm-muted hover:text-dm-text"
          >
            Account
          </Link>
          <Link
            href="/dashboard/join"
            className="dm-interactive dm-focus-ring rounded-md px-2 py-1 text-[11px] font-semibold text-dm-muted hover:text-dm-text sm:hidden"
          >
            Join
          </Link>
          <span title={email} className="hidden max-w-[8rem] truncate text-[11px] text-dm-muted xl:inline">
            {email}
          </span>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user avatars from Supabase storage
            <img
              src={avatarUrl}
              alt={profileLabel}
              className="h-7 w-7 shrink-0 rounded-lg border border-[var(--dm-border-strong)] object-cover shadow-sm lg:h-8 lg:w-8"
            />
          ) : (
            <div
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface-mid text-[9px] font-bold uppercase text-dm-text shadow-sm lg:h-8 lg:w-8"
              aria-hidden
            >
              {initials}
            </div>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="dm-interactive dm-focus-ring touch-manipulation rounded-md border border-dashed border-[var(--dm-border-strong)] bg-transparent px-2.5 py-1.5 text-[11px] font-medium text-dm-muted hover:border-dm-electric hover:text-dm-text min-h-[40px] sm:min-h-0"
            >
              Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
