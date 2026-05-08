import Link from "next/link";

import { signOut } from "@/lib/auth/actions";

type Props = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  showAdmin?: boolean;
};

function initialsFromIdentity(email: string, displayName?: string | null) {
  const base = displayName?.trim() || email.split("@")[0] || "?";
  return base
    .slice(0, 2)
    .toUpperCase();
}

export function WorkspaceHeader({ email, displayName, avatarUrl, showAdmin }: Props) {
  const initials = initialsFromIdentity(email, displayName);
  const profileLabel = displayName?.trim() || email;

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--dm-border-strong)] bg-dm-surface/92 pt-[env(safe-area-inset-top)] shadow-[var(--cozy-shadow-paper)] backdrop-blur-sm">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:h-14 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-xl font-semibold text-dm-text md:text-[1.35rem]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static public brand logo */}
            <img src="/logo.png" alt="" className="h-7 w-7 rounded-md object-cover" aria-hidden />
            Koti
          </Link>
          <Link href="/dashboard/join" className="hidden rounded-md border border-dashed border-[var(--dm-border-strong)] px-2.5 py-1 text-xs font-semibold text-dm-muted hover:border-dm-electric hover:text-dm-text sm:inline-flex">
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
    </header>
  );
}
