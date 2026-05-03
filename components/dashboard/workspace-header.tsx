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
    <header className="sticky top-0 z-40 border-b-[3px] border-dm-electric bg-dm-surface/90 backdrop-blur-md">
      <div className="flex h-[3.25rem] items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="border-[3px] border-dm-electric px-3 py-1 font-mono text-[13px] font-black uppercase tracking-wide text-dm-text shadow-[4px_4px_0_0_var(--dm-border-strong)]"
          >
            DormMate
          </Link>
          <span className="hidden h-6 w-[3px] bg-dm-electric/40 sm:block" aria-hidden />
          <Link
            href="/"
            className="hidden text-[10px] font-black uppercase tracking-widest text-dm-muted transition hover:text-dm-electric sm:inline"
          >
            WWW
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showAdmin ? (
            <Link
              href="/dashboard/admin"
              className="border-[3px] border-transparent px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-dm-accent transition hover:border-dm-accent"
            >
              Admin
            </Link>
          ) : null}
          <div className="hidden items-center gap-2 sm:flex">
            <span
              title={email}
              className="max-w-[11rem] truncate font-mono text-[10px] font-medium uppercase tracking-wide text-dm-muted"
            >
              {email}
            </span>
          </div>
          <div
            className="flex h-9 w-9 items-center justify-center border-[3px] border-dm-electric bg-dm-accent font-mono text-[11px] font-black uppercase text-dm-accent-ink"
            aria-hidden
          >
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="border-[3px] border-dm-border-strong bg-dm-bg px-3 py-1.5 font-mono text-[10px] font-black uppercase tracking-widest text-dm-text shadow-[3px_3px_0_0_var(--dm-electric)] transition hover:bg-dm-surface"
            >
              Exit
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
