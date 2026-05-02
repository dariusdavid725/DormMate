import type { Metadata } from "next";

import Link from "next/link";

import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Log in",
  robots: "noindex, nofollow",
};

type Props = {
  searchParams: Promise<{ next?: string; error?: string }>;
};

export default async function LoginPage({ searchParams }: Props) {
  const q = await searchParams;
  const nextHref =
    typeof q.next === "string" && q.next.startsWith("/") && !q.next.startsWith("//")
      ? q.next
      : "/dashboard";
  const urlError =
    typeof q.error === "string" ? decodeURIComponent(q.error) : undefined;

  return (
    <>
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
          Welcome back
        </h1>
        <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
          Log in to your household workspace.
        </p>
      </div>
      <div className="rounded-2xl border border-zinc-200 bg-white p-8 shadow-sm dark:border-zinc-700 dark:bg-zinc-900">
        <LoginForm nextHref={nextHref} urlError={urlError} />
      </div>
      <p className="mt-6 text-center text-sm text-zinc-500">
        New to DormMate?{" "}
        <Link href="/signup" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Create an account
        </Link>
      </p>
    </>
  );
}
