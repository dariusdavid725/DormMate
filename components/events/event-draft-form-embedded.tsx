"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

import {
  createHouseholdEvent,
  type EventActionState,
} from "@/lib/events/actions";

function Idle({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Posting…" : idle;
}

export function EventDraftFormEmbedded({
  householdId,
}: {
  householdId: string;
}) {
  const [state, formAction] = useActionState<
    EventActionState | null,
    FormData
  >(async (prev, fd) => (await createHouseholdEvent(prev ?? undefined, fd)) ?? null, null);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <input type="hidden" name="household_id" value={householdId} />
      {state?.error ?
        <p role="alert" className="text-sm text-dm-danger">
          {state.error}
        </p>
      : null}
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Title
        </span>
        <input
          name="title"
          required
          maxLength={200}
          placeholder="Kitchen dance party"
          className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg px-3 py-2.5 text-sm outline-none focus:border-dm-electric"
        />
      </label>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Notes
        </span>
        <textarea
          name="description"
          rows={3}
          maxLength={800}
          className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg px-3 py-2.5 text-sm outline-none focus:border-dm-electric"
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Starts
          </span>
          <input
            name="starts_at"
            type="datetime-local"
            required
            className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg px-3 py-2.5 text-sm outline-none focus:border-dm-electric"
          />
        </label>
        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Ends · optional
          </span>
          <input
            name="ends_at"
            type="datetime-local"
            className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg px-3 py-2.5 text-sm outline-none focus:border-dm-electric"
          />
        </label>
      </div>
      <label className="block">
        <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Bring list · one line per doodle on the flyer
        </span>
        <textarea
          name="bring_list"
          rows={4}
          maxLength={2000}
          placeholder={"Snacks\nPaper plates\nPortable speaker"}
          className="mt-2 w-full resize-y rounded-md border border-[var(--dm-border-strong)] bg-dm-bg px-3 py-2.5 text-sm outline-none focus:border-dm-electric"
        />
      </label>
      <button
        type="submit"
        className="rounded-md bg-dm-electric px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105"
      >
        <Idle idle="Pin to corkboard" />
      </button>
    </form>
  );
}
