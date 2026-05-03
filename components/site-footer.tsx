import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200/90 bg-[#fafafa] dark:border-stone-800 dark:bg-stone-950">
      <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-8 text-xs text-stone-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-stone-500">
        <p>© {new Date().getFullYear()} DormMate</p>
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-stone-600 transition hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-200"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
