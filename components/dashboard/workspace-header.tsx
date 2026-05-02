import Link from "next/link";

import { signOut } from "@/lib/auth/actions";

type Props = {
  email: string;
};

export function WorkspaceHeader({ email }: Props) {
  const initials = email
    ? email
        .split("@")[0]
        .slice(0, 2)
        .toUpperCase()
    : "?";

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200/90 bg-white/90 backdrop-blur-md dark:border-zinc-800/90 dark:bg-zinc-950/90">
      <div className="flex h-[3.35rem] items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-zinc-900 dark:text-white"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-emerald-600 text-xs font-semibold tracking-tight text-white shadow-sm ring-2 ring-black/5 dark:ring-white/10">
              DM
            </span>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-[15px] font-semibold leading-tight tracking-tight">
                DormMate
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                Workspace
              </div>
            </div>
          </Link>
          <span className="hidden h-6 w-px bg-zinc-200 sm:block dark:bg-zinc-800" aria-hidden />
          <Link
            href="/"
            className="hidden text-xs font-medium text-zinc-500 transition hover:text-zinc-800 sm:inline dark:text-zinc-400 dark:hover:text-zinc-200"
          >
            Marketing site
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span
              title={email}
              className="max-w-[10rem] truncate text-xs text-zinc-600 dark:text-zinc-400"
            >
              {email}
            </span>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border border-zinc-200 bg-zinc-50 text-[10px] font-semibold uppercase text-zinc-700 shadow-sm dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-200"
            aria-hidden
          >
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-800 shadow-sm transition hover:bg-zinc-50 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
