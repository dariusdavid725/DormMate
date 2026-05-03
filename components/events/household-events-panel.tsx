"use client";

import { useFormStatus } from "react-dom";

import {
  claimBringItem,
  upsertEventRsvp,
} from "@/lib/events/actions";

import type {
  EventRsvpRow,
  HouseholdEventRow,
} from "@/lib/events/queries";

function SubmitPulse({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "…" : idle;
}

type MemberChip = { userId: string; label: string };

export function HouseholdEventsPanel({
  householdId,
  events,
  rsvps,
  currentUserId,
  membersById,
}: {
  householdId: string;
  events: HouseholdEventRow[];
  rsvps: EventRsvpRow[];
  currentUserId: string;
  membersById: Record<string, string>;
}) {
  const upcoming = [...events].filter(
    (e) => new Date(e.startsAt).getTime() >= Date.now() - 36e5,
  );
  const past = [...events].filter(
    (e) => new Date(e.startsAt).getTime() < Date.now() - 36e5,
  );

  function rsvpFor(eventId: string) {
    return rsvps.find((r) => r.eventId === eventId && r.userId === currentUserId)?.status ??
      null;
  }

  if (!events.length) {
    return (
      <div className="cozy-note cozy-tilt-xs px-4 py-6 text-[13px] text-dm-muted shadow-[var(--cozy-shadow-note)]">
        No hangouts drafted — host a pancake morning or hallway movie night via the flyer form.
      </div>
    );
  }

  return (
    <div className="space-y-10">
      {upcoming.length ? (
        <div>
          <h3 className="font-cozy-display text-2xl text-dm-text">Upcoming</h3>
          <ul className="mt-6 space-y-8">
            {upcoming.map((ev) => (
              <EventCard
                key={ev.id}
                ev={ev}
                householdId={householdId}
                currentUserId={currentUserId}
                memberLabels={membersById}
                myRsvp={rsvpFor(ev.id)}
              />
            ))}
          </ul>
        </div>
      ) : null}

      {past.length ? (
        <div>
          <h3 className="font-cozy-display text-xl text-dm-muted">
            Wrapped up
          </h3>
          <ul className="mt-4 space-y-3">
            {past.slice(0, 8).map((ev) => (
              <li
                key={ev.id}
                className="rounded-md border border-dashed border-[var(--dm-border-strong)] px-3 py-2 text-[13px] text-dm-muted line-through decoration-dm-muted/50"
              >
                {ev.title}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function EventCard({
  ev,
  householdId,
  currentUserId,
  memberLabels,
  myRsvp,
}: {
  ev: HouseholdEventRow;
  householdId: string;
  currentUserId: string;
  memberLabels: Record<string, string>;
  myRsvp: EventRsvpRow["status"] | null;
}) {
  const start = formatWhen(ev.startsAt);
  const who = memberLabels[ev.createdBy]?.trim() || "Mate";

  return (
    <li className="cozy-poster cozy-tilt-xs p-5 shadow-[var(--cozy-shadow-paper)]">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
        {start}
      </p>
      <h4 className="mt-1 font-cozy-display text-3xl text-dm-text">{ev.title}</h4>
      {ev.description?.trim() ? (
        <p className="mt-2 whitespace-pre-wrap text-[13px] text-dm-muted">
          {ev.description}
        </p>
      ) : null}
      <p className="mt-2 text-[11px] text-dm-muted">
        Hosted by <span className="font-semibold text-dm-text">{who}</span>
      </p>

      <div className="mt-5 flex flex-wrap gap-3">
        {(["going", "maybe", "not_going"] as const).map((st) => (
          <form key={st} action={upsertEventRsvp}>
            <input type="hidden" name="household_id" value={householdId} />
            <input type="hidden" name="event_id" value={ev.id} />
            <input type="hidden" name="status" value={st} />
            <button
              type="submit"
              className={[
                "rounded-full px-5 py-2 text-xs font-semibold uppercase tracking-wide ring-1",
                myRsvp === st
                  ? "bg-dm-accent-warn-bg text-dm-text ring-[var(--dm-border-strong)]"
                  : "bg-dm-surface text-dm-muted ring-transparent hover:text-dm-text",
              ].join(" ")}
            >
              <SubmitPulse
                idle={
                  st === "going"
                    ? "Going"
                    : st === "maybe"
                      ? "Maybe"
                      : "Can't"
                }
              />
            </button>
          </form>
        ))}
      </div>

      {ev.bringList?.length ? (
        <div className="mt-6 border-t border-dashed border-[var(--dm-border-strong)] pt-6">
          <p className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Bring list
          </p>
          <ul className="mt-3 space-y-2">
            {ev.bringList.map((item) => {
              const claimed = item.claimed_by
                ? memberLabels[item.claimed_by] ?? item.claimed_by.slice(0, 8)
                : null;
              const mine =
                item.claimed_by && item.claimed_by === currentUserId;

              return (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-sm text-dm-text"
                >
                  <span>{item.label}</span>
                  <span className="text-[11px] text-dm-muted">
                    {claimed ? (
                      <>
                        <span className="font-semibold text-dm-text">{claimed}</span>{" "}
                        bringing this
                      </>
                    ) : (
                      <>Unclaimed · jump in ⇣</>
                    )}
                  </span>
                  {!claimed ? (
                    <form action={claimBringItem}>
                      <input type="hidden" name="household_id" value={householdId} />
                      <input type="hidden" name="event_id" value={ev.id} />
                      <input type="hidden" name="item_id" value={item.id} />
                      <button
                        type="submit"
                        className="text-[11px] font-bold text-dm-electric hover:underline"
                      >
                        Claim
                      </button>
                    </form>
                  ) : mine ? (
                    <form action={claimBringItem}>
                      <input type="hidden" name="household_id" value={householdId} />
                      <input type="hidden" name="event_id" value={ev.id} />
                      <input type="hidden" name="item_id" value={item.id} />
                      <input type="hidden" name="unclaim" value="1" />
                      <button
                        type="submit"
                        className="text-[11px] font-bold text-dm-muted hover:underline"
                      >
                        Drop
                      </button>
                    </form>
                  ) : null}
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}
    </li>
  );
}

function formatWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
