"use client";

import { useActionState } from "react";
import Link from "next/link";

import type { AuthFormState } from "@/lib/auth/actions";
import { signUp } from "@/lib/auth/actions";

const initialState: AuthFormState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUp, initialState);

  if (state?.ok === true && state.message) {
    return (
      <div
        role="status"
        className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100"
      >
        <p className="font-medium">Almost there.</p>
        <p className="mt-1">{state.message}</p>
        <p className="mt-4">
          <Link
            href="/login"
            className="font-medium text-emerald-800 underline dark:text-emerald-300"
          >
            Continue to login
          </Link>
        </p>
      </div>
    );
  }

  return (
    <form action={formAction} className="flex flex-col gap-5">
      {state?.error && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/60 dark:text-red-200"
        >
          {state.error}
        </div>
      )}

      <div>
        <label
          htmlFor="signup-email"
          className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Email
        </label>
        <input
          id="signup-email"
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
          htmlFor="signup-password"
          className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 characters"
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>
      <div>
        <label
          htmlFor="signup-confirm"
          className="mb-1.5 block text-sm font-medium text-zinc-800 dark:text-zinc-200"
        >
          Confirm password
        </label>
        <input
          id="signup-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-zinc-900 shadow-sm outline-none ring-emerald-500/30 focus:ring-2 dark:border-zinc-600 dark:bg-zinc-900 dark:text-white"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="mt-2 w-full rounded-lg bg-emerald-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700 disabled:opacity-70"
      >
        {pending ? "Creating account…" : "Create account"}
      </button>
      <p className="text-center text-sm text-zinc-600 dark:text-zinc-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-700 hover:underline dark:text-emerald-400">
          Log in
        </Link>
      </p>
    </form>
  );
}
