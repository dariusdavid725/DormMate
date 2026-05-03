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
    <header className="sticky top-0 z-40 border-b border-stone-200/90 bg-[#f7f6f4]/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between gap-4 px-4 lg:px-8">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href="/dashboard"
            className="min-w-0 text-[15px] font-semibold tracking-tight text-stone-900"
          >
            DormMate
          </Link>
          <span className="hidden h-6 w-px bg-stone-200 sm:block" aria-hidden />
          <Link
            href="/"
            className="hidden text-xs font-medium text-stone-500 transition hover:text-stone-900 sm:inline"
          >
            Home
          </Link>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          {showAdmin ? (
            <Link
              href="/dashboard/admin"
              className="rounded-lg px-3 py-2 text-xs font-semibold text-teal-800 transition hover:bg-teal-50 hover:text-teal-900"
            >
              Admin
            </Link>
          ) : null}
          <div className="hidden items-center gap-2 sm:flex">
            <span
              title={email}
              className="max-w-[10rem] truncate text-xs text-stone-600"
            >
              {email}
            </span>
          </div>
          <div
            className="flex h-8 w-8 items-center justify-center rounded-full border border-stone-200 bg-stone-100 text-[10px] font-semibold uppercase text-stone-800"
            aria-hidden
          >
            {initials}
          </div>
          <form action={signOut}>
            <button
              type="submit"
              className="rounded-lg border border-stone-200 bg-white px-3 py-1.5 text-xs font-medium text-stone-800 transition hover:bg-stone-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
}
