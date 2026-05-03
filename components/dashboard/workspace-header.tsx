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
    <header className="sticky top-0 z-40 border-b border-[var(--dm-border-strong)] bg-dm-surface/95 backdrop-blur-sm">
      <div className="flex h-12 items-center justify-between gap-4 px-4 lg:h-14 lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/dashboard"
            className="text-[16px] font-semibold tracking-tight text-dm-text hover:text-dm-electric"
          >
            DormMate
          </Link>
          <Link
            href="/"
            className="hidden text-sm text-dm-muted hover:text-dm-text sm:inline"
          >
            About
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 lg:gap-3">
          {showAdmin ? (
            <Link
              href="/dashboard/admin"
              className="rounded-md px-2.5 py-1 text-xs font-medium text-dm-electric hover:underline"
            >
              Admin
            </Link>
          ) : null}
          <span
            title={email}
            className="hidden max-w-[11rem] truncate text-xs text-dm-muted lg:inline"
          >
            {email}
          </span>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full bg-dm-electric text-[10px] font-semibold text-[var(--dm-accent-ink)]"
            aria-hidden
          >
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-md border border-[var(--dm-border-strong)] px-3 py-1 text-xs font-medium text-dm-muted hover:border-dm-electric hover:text-dm-text"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
