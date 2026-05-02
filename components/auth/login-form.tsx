"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { AuthFormState } from "@/lib/auth/actions";
import { signIn } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

type Props = {
  nextHref: string;
  urlError?: string;
};

export function LoginForm({ nextHref, urlError }: Props) {
  const [state, formAction, pending] = useActionState(signIn, initialState);

  return (
    <form action={formAction} className="flex flex-col gap-5">
      <input type="hidden" name="next" value={nextHref} readOnly />

      {(urlError || state?.error) && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200"
        >
          {urlError ?? state?.error}
        </div>
      )}

      <div>
        <label
          htmlFor="email"
          className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.edu"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-emerald-500/30 placeholder:text-zinc-400 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white dark:placeholder:text-zinc-500"
        />
      </div>
      <div>
        <label
          htmlFor="password"
          className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
      >
        {pending ? "Signing in…" : "Log in"}
      </button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        No account?{" "}
        <Link href="/signup" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Create one
        </Link>
      </p>
    </form>
  );
}
