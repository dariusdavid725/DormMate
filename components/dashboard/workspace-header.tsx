import Link from "next/link";

import { signOut } from "@/lib/auth/actions";

type Props = {
  email: string;
  showAdmin?: boolean;
};

export function WorkspaceHeader({ email, showAdmin }: Props) {
  const initials = email
    ? email
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--dm-border-strong)] bg-dm-surface/85 backdrop-blur-xl">
      <div className="flex h-[3.35rem] items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/dashboard"
            className="text-[17px] font-semibold tracking-tight text-dm-text transition hover:text-dm-electric"
          >
            DormMate
          </Link>
          <Link
            href="/"
            className="hidden text-sm font-medium text-dm-muted transition hover:text-dm-electric sm:inline"
          >
            About
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-3">
          {showAdmin ? (
            <Link
              href="/dashboard/admin"
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-dm-electric transition hover:bg-[var(--dm-accent-soft)]"
            >
              Admin
            </Link>
          ) : null}
          <span
            title={email}
            className="hidden max-w-[12rem] truncate text-xs text-dm-muted lg:inline"
          >
            {email}
          </span>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-dm-accent/85 to-teal-500/60 text-[11px] font-semibold text-dm-accent-ink shadow-inner shadow-black/5"
            aria-hidden
          >
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-[var(--dm-border-strong)] px-4 py-1.5 text-xs font-semibold text-dm-muted transition hover:border-dm-muted hover:text-dm-text"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
