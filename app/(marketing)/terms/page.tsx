import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms",
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="font-cozy-display text-[2.85rem] leading-[1.1] text-dm-text">
        House rules (terms)
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-dm-muted">
        Koti is provided “as is” during early access. Availability and features may
        change. Do not use the preview for regulated financial obligations without
        independent verification; expense splits are informational tools, not legal
        or tax advice. A full agreement will supersede this page before general release.
      </p>
      <p className="mt-10">
        <Link
          href="/"
          className="text-sm font-bold text-dm-electric underline decoration-dm-electric/35 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40"
        >
          ← Home
        </Link>
      </p>
    </div>
  );
}
