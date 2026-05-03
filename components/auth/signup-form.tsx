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
        className="dm-card-surface dm-fade-in-up rounded-xl p-6 text-sm text-dm-text ring-1 ring-[color-mix(in_srgb,var(--dm-accent)_35%,transparent)]"
      >
        <p className="font-black text-dm-accent">Almost dorm official.</p>
        <p className="mt-2 leading-relaxed text-dm-muted">{state.message}</p>
        <p className="mt-5">
          <Link
            href="/login"
            className="font-bold text-dm-electric underline decoration-dm-electric/35 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40"
          >
            Continue to login →
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
          className="dm-fade-in-up rounded-xl border border-dm-danger/45 bg-[color-mix(in_srgb,var(--dm-danger)_10%,transparent)] px-4 py-3 text-sm font-medium text-dm-danger"
        >
          {state.error}
        </div>
      )}

      <div>
        <label htmlFor="signup-email" className="dm-field-label">
          Email
        </label>
        <input
          id="signup-email"
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@university.edu"
          className="dm-field-input"
        />
      </div>
      <div>
        <label htmlFor="signup-password" className="dm-field-label">
          Password
        </label>
        <input
          id="signup-password"
          name="password"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          placeholder="At least 8 spicy characters"
          className="dm-field-input"
        />
      </div>
      <div>
        <label htmlFor="signup-confirm" className="dm-field-label">
          Confirm password
        </label>
        <input
          id="signup-confirm"
          name="confirm"
          type="password"
          autoComplete="new-password"
          required
          minLength={8}
          className="dm-field-input"
        />
      </div>
      <button
        type="submit"
        disabled={pending}
        className="dm-btn-primary dm-hover-tap mt-2 w-full !py-3 !text-[15px] disabled:pointer-events-none disabled:opacity-50"
      >
        {pending ? "Summoning roommate OS…" : "Create dorm profile"}
      </button>
      <p className="text-center text-sm text-dm-muted">
        Already initiated?{" "}
        <Link
          href="/login"
          className="font-bold text-dm-electric underline decoration-dm-electric/35 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40"
        >
          Log in
        </Link>
      </p>
    </form>
  );
}
