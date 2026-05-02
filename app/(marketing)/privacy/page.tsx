import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6">
      <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-white">
        Privacy policy
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
        DormMate is under active development. We use Supabase for authentication and
        data hosting. When you sign up, account data is processed according to the
        Supabase and hosting providers&apos; policies. Contact the operator of this
        deployment for deletion requests once a formal policy is published.
      </p>
      <p className="mt-10">
        <Link href="/" className="text-sm font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          ← Home
        </Link>
      </p>
    </div>
  );
}
