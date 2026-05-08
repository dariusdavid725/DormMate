"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  joinHouseholdByInviteCode,
  type InviteActionState,
} from "@/lib/households/actions";

function Submit({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Joining…" : idle;
}

export function JoinHouseholdForm({
  initialCode,
}: {
  initialCode?: string | null;
}) {
  const [state, formAction] = useActionState<
    InviteActionState | null,
    FormData
  >(async (prev, fd) => (await joinHouseholdByInviteCode(prev ?? undefined, fd)) ?? null, null);

  return (
    <form action={formAction} className="space-y-5">
      {state?.error ? (
        <p
          role="alert"
          className="rounded-md border border-dm-danger/40 bg-dm-surface px-3 py-2 text-sm text-dm-danger"
        >
          {state.error}
        </p>
      ) : null}
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Invite code
        </span>
        <input
          name="code"
          defaultValue={initialCode ?? ""}
          required
          minLength={4}
          placeholder="Paste the postcard code…"
          className="mt-2 w-full rounded-lg border border-[var(--dm-border-strong)] bg-dm-bg/80 px-3 py-3 font-mono text-sm uppercase outline-none focus:border-dm-electric"
          autoCapitalize="characters"
        />
      </label>
      <button
        type="submit"
        className="w-full rounded-md bg-dm-electric py-3 text-sm font-semibold text-white hover:brightness-105"
      >
        <Submit idle="Join home" />
      </button>
    </form>
  );
}
