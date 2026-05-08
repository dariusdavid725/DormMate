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
  return base
    .slice(0, 2)
    .toUpperCase();
}

export function WorkspaceHeader({ email, displayName, avatarUrl, showAdmin, households = [] }: Props) {
  const initials = initialsFromIdentity(email, displayName);
  const profileLabel = displayName?.trim() || email;

  return (
    <header className="dm-topbar-shell sticky top-0 z-40 border-b border-[var(--dm-border-strong)] pt-[env(safe-area-inset-top)] shadow-[0_8px_20px_rgba(28,39,56,0.08)] backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-[1260px] items-center justify-between gap-4 px-4 lg:h-16 lg:px-7">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2.5 rounded-xl border border-[var(--dm-border)] bg-dm-surface px-2.5 py-1.5 text-lg font-semibold text-dm-text shadow-[0_8px_16px_rgba(28,39,56,0.08)] md:text-[1.2rem]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public brand logo */}
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-cover" aria-hidden />
            Koti
          </Link>
          <Link href="/dashboard/join" className="hidden rounded-md border border-dashed border-[var(--dm-border-strong)] px-2.5 py-1 text-xs font-semibold text-dm-muted transition-colors hover:border-dm-electric hover:text-dm-text sm:inline-flex">
            Join home
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:gap-3">
          {showAdmin ? (
            <Link
              href="/dashboard/admin"
              className="rounded-md px-2 py-1 text-xs font-semibold text-dm-electric hover:underline"
            >
              Site admin
            </Link>
          ) : null}
          <Link
            href="/dashboard/settings"
            className="rounded-md px-2 py-1 text-xs font-semibold text-dm-muted hover:text-dm-text"
          >
            Account
          </Link>
          <Link
            href="/dashboard/join"
            className="rounded-md px-2 py-1 text-xs font-semibold text-dm-muted hover:text-dm-text sm:hidden"
          >
            Join home
          </Link>
          <span
            title={email}
            className="hidden max-w-[11rem] truncate text-xs text-dm-muted lg:inline"
          >
            {email}
          </span>
          {avatarUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- user avatars from Supabase storage
            <img
              src={avatarUrl}
              alt={profileLabel}
              className="h-8 w-8 shrink-0 rounded-lg border border-[var(--dm-border-strong)] object-cover shadow-[1px_2px_0_rgba(54,47,40,0.06)]"
            />
          ) : (
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface-mid text-[10px] font-bold uppercase text-dm-text shadow-[1px_2px_0_rgba(54,47,40,0.06)]"
              aria-hidden
            >
              {initials}
            </div>
          )}
          <form action={signOut}>
            <button
              type="submit"
              className="touch-manipulation rounded-md border border-dashed border-[var(--dm-border-strong)] bg-transparent px-3 py-2 text-xs font-medium text-dm-muted min-h-[44px] sm:min-h-0 sm:py-1.5 hover:border-dm-electric hover:text-dm-text"
            >
              Out
            </button>
          </form>
        </div>
      </div>
      {households.length > 0 ? (
        <div className="mx-auto hidden w-full max-w-[1260px] items-center gap-2 overflow-x-auto px-4 pb-2 lg:flex lg:px-7">
          {households.slice(0, 6).map((h) => (
            <Link
              key={h.id}
              href={`/dashboard/household/${h.id}`}
              className="inline-flex shrink-0 items-center gap-2 rounded-full border border-[var(--dm-border-strong)] bg-dm-surface px-3 py-1.5 text-[12px] text-dm-muted transition-colors hover:border-dm-electric hover:text-dm-text"
            >
              <span className="inline-flex h-5 w-5 items-center justify-center rounded-full bg-dm-surface-mid text-[10px] font-semibold text-dm-text">
                {h.name.slice(0, 1).toUpperCase()}
              </span>
              <span className="max-w-[9rem] truncate">{h.name}</span>
            </Link>
          ))}
        </div>
      ) : null}
    </header>
  );
}
