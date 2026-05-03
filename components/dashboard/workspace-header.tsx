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
    <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,var(--dm-electric)_15%,transparent)] bg-[color-mix(in_srgb,var(--dm-surface)_88%,transparent)] shadow-[0_12px_40px_-32px_var(--dm-electric-glow)] backdrop-blur-2xl">
      <div className="flex h-[3.2rem] items-center justify-between gap-4 px-4 lg:h-[3.45rem] lg:px-8">
        <div className="flex min-w-0 items-center gap-6">
          <Link
            href="/dashboard"
            className="text-[17px] font-black tracking-tight text-dm-text transition hover:text-dm-electric"
          >
            DormMate<span className="text-dm-fun">.</span>
          </Link>
          <Link
            href="/"
            className="hidden text-sm font-semibold text-dm-muted transition hover:text-dm-electric sm:inline"
          >
            About
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2.5 lg:gap-3">
          {showAdmin ? (
            <Link
              href="/dashboard/admin"
              className="rounded-full border border-[color-mix(in_srgb,var(--dm-electric)_35%,transparent)] px-3 py-1.5 text-xs font-bold text-dm-electric transition hover:bg-[color-mix(in_srgb,var(--dm-electric)_12%,transparent)]"
            >
              Admin
            </Link>
          ) : null}
          <span
            title={email}
            className="hidden max-w-[12rem] truncate text-[11px] font-medium text-dm-muted lg:inline"
          >
            {email}
          </span>
          <div
            className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-dm-electric via-dm-accent to-teal-400 text-[11px] font-black text-[#071018] shadow-[0_10px_30px_-8px_var(--dm-electric-glow)] ring-2 ring-black/25"
            aria-hidden
          >
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-full border border-[var(--dm-border-strong)] px-4 py-1.5 text-xs font-bold text-dm-muted transition hover:border-dm-muted hover:bg-[color-mix(in_srgb,var(--dm-surface-mid)_80%,transparent)] hover:text-dm-text"
            >
              Out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
