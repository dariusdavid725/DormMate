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
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#faf8f5]/92 backdrop-blur-md dark:border-stone-800/90 dark:bg-stone-950/92">
      <div className="flex h-[3.35rem] items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="flex items-center gap-2.5 text-stone-900 dark:text-white"
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-xs font-semibold tracking-tight text-white shadow-md shadow-teal-900/20 dark:shadow-black/40">
              DM
            </span>
            <div className="hidden min-w-0 sm:block">
              <div className="truncate text-[15px] font-semibold leading-tight tracking-tight">
                DormMate
              </div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-stone-500 dark:text-stone-400">
                Your space
              </div>
            </div>
          </Link>
          <span className="hidden h-6 w-px bg-stone-200 sm:block dark:bg-stone-800" aria-hidden />
          <Link
            href="/"
            className="hidden text-xs font-medium text-stone-500 transition hover:text-teal-800 sm:inline dark:text-stone-400 dark:hover:text-teal-300"
          >
            Marketing site
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <div className="hidden items-center gap-2 sm:flex">
            <span
              title={email}
              className="max-w-[10rem] truncate text-xs text-stone-600 dark:text-stone-400"
            >
              {email}
            </span>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-amber-50/80 text-[10px] font-semibold uppercase text-stone-800 shadow-sm dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
            aria-hidden
          >
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-xl border border-stone-200 bg-white px-3 py-1.5 text-xs font-semibold text-stone-800 shadow-sm transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
