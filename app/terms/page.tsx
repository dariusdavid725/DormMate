import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Terms of use
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        DormMate is provided “as is” during early access. Availability and features may
        change. Do not use the preview for regulated financial obligations without
        independent verification; expense splits are informational tools, not legal
        or tax advice. A full agreement will supersede this page before general release.
      </p>
      <p className="mt-10">
        <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          ← Home
        </Link>
      </p>
    </div>
  );
}
