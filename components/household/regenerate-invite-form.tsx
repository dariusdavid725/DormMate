"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  regenerateInviteFormAction,
  type InviteActionState,
} from "@/lib/households/actions";

function Submit({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "…" : idle;
}

export function RegenerateInviteButton({ householdId }: { householdId: string }) {
  const [state, formAction] = useActionState<
    InviteActionState | null,
    FormData
  >(
    async (prev, fd) => (await regenerateInviteFormAction(prev ?? undefined, fd)) ?? null,
    null,
  );

  return (
    <form action={formAction} className="mt-4 space-y-2">
      <input type="hidden" name="household_id" value={householdId} />
      {state?.error ?
        <p className="text-[12px] text-dm-danger">{state.error}</p>
      : null}
      {state?.code ?
        <p className="rounded-md bg-dm-surface px-2 py-1 font-mono text-xs text-dm-text">
          New code:&nbsp;{state.code}
        </p>
      : null}
      <button
        type="submit"
        className="rounded-md border border-dashed border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-muted hover:border-dm-electric hover:text-dm-electric"
      >
        <Submit idle="Regenerate code" />
      </button>
    </form>
  );
}
