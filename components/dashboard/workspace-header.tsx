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
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#fafafa]/95 backdrop-blur-md dark:border-stone-800/90 dark:bg-stone-950/95">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="min-w-0 text-[15px] font-semibold tracking-tight text-stone-900 dark:text-stone-50"
          >
            DormMate
          </Link>
          <span className="hidden h-6 w-px bg-stone-200 sm:block dark:bg-stone-800" aria-hidden />
          <Link
            href="/"
            className="hidden text-xs font-medium text-stone-500 transition hover:text-stone-900 sm:inline dark:text-stone-400 dark:hover:text-stone-200"
          >
            Home
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
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-[10px] font-semibold uppercase text-stone-800 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-200"
            aria-hidden
          >
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition hover:bg-stone-50 dark:border-stone-700 dark:bg-stone-900 dark:text-stone-100 dark:hover:bg-stone-800"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
