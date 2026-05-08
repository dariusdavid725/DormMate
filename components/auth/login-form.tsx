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
          className="dm-fade-in-up rounded-xl border border-dm-danger/45 bg-[color-mix(in_srgb,var(--dm-danger)_10%,transparent)] px-4 py-3 text-sm font-medium text-dm-danger"
        >
          {urlError ?? state?.error}
        </div>
      )}

      <div>
        <label htmlFor="email" className="dm-field-label">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.edu"
          className="dm-field-input"
        />
      </div>
      <div>
        <label htmlFor="password" className="dm-field-label">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          required
          placeholder="••••••••"
          className="dm-field-input"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="dm-btn-primary dm-hover-tap mt-1 w-full !py-3 !text-[15px] disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Signing in…" : "Beam me in"}
      </button>
      <p className="text-center text-sm text-dm-muted">
        Fresh on campus?{" "}
        <Link
          href={`/signup?next=${encodeURIComponent(nextHref)}`}
          className="font-bold text-dm-electric underline decoration-dm-electric/35 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40"
        >
          Spawn an account
        </Link>
      </p>
    </form>
  );
}
