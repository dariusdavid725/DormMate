import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:py-16">
      <h1 className="font-cozy-display text-[2.85rem] leading-[1.1] text-dm-text">
        Privacy notes
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-dm-muted">
        Koti is under active development. We use Supabase for authentication and
        data hosting. When you sign up, account data is processed according to the
        Supabase and hosting providers&apos; policies. Contact the operator of this
        deployment for deletion requests once a formal policy is published.
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
