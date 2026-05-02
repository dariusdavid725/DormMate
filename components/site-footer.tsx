import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-stone-200 bg-gradient-to-b from-amber-50/40 to-transparent dark:border-stone-800 dark:from-stone-950 dark:to-stone-950">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-10 text-sm text-stone-600 sm:flex-row sm:items-center sm:justify-between sm:px-6 dark:text-stone-400">
        <p className="text-stone-500 dark:text-stone-500">
          © {new Date().getFullYear()} DormMate — shared homes, fewer tense chats.
        </p>
        <div className="flex gap-8">
          <Link
            href="/privacy"
            className="font-medium text-stone-600 hover:text-teal-800 dark:text-stone-400 dark:hover:text-teal-300"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="font-medium text-stone-600 hover:text-teal-800 dark:text-stone-400 dark:hover:text-teal-300"
          >
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
