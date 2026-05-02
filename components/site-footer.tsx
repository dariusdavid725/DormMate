import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-zinc-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-zinc-400">
        <p className="text-zinc-500 dark:text-zinc-500">
          © {new Date().getFullYear()} DormMate. Built for fair shared living.
        </p>
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="hover:text-zinc-900 dark:hover:text-white"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="hover:text-zinc-900 dark:hover:text-white"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
