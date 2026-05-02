import type { Metadata } from "next";

import Link from "next/link";

import { SignupForm } from "@/components/auth/signup-form";

export const metadata: Metadata = {
  title: "Create account",
  robots: "noindex, nofollow",
};

export default function SignupPage() {
  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Create your DormMate account
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Invite roommates later from the dashboard.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <SignupForm />
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        <Link href="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Already have an account?
        </Link>
      </p>
    </>
  );
}
