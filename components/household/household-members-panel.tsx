"use client";

import { useFormStatus } from "react-dom";

import type { HouseholdMemberRow } from "@/lib/households/queries";
import {
  updateProfileDisplayName,
  uploadProfileAvatar,
} from "@/lib/profiles/actions";

function formatJoined(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function labelForMember(m: HouseholdMemberRow) {
  if (m.displayName?.trim()) return m.displayName.trim();
  return `Member · ${m.userId.slice(0, 6)}…`;
}

function SubmitPending({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return <>{pending ? "Staging…" : idle}</>;
}

export function HouseholdMembersPanel({
  members,
  currentUserId,
  householdId,
}: {
  members: HouseholdMemberRow[];
  currentUserId: string;
  householdId: string;
}) {
  const sorted = [...members].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return labelForMember(a).localeCompare(labelForMember(b));
  });

  return (
    <div className="space-y-10">
      <section className="border-[3px] border-dm-electric bg-dm-surface p-6 shadow-[6px_6px_0_0_var(--dm-border-strong)]">
        <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.22em] text-dm-muted">
          Your cockpit ID
        </h3>
        <p className="mt-2 text-xs leading-relaxed text-dm-muted">
          Visible inside this dorm only · photo stored in guarded Supabase lanes.
        </p>
        <form action={updateProfileDisplayName} className="mt-6 flex flex-wrap gap-3">
          <input type="hidden" name="household_id" value={householdId} />
          <label className="sr-only" htmlFor="display_name">
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            maxLength={80}
            placeholder="Alias · dorm-safe"
            defaultValue={
              sorted.find((x) => x.userId === currentUserId)?.displayName ?? ""
            }
            className="min-w-[12rem] flex-1 rounded-none border-[3px] border-dm-border-strong bg-dm-bg px-3 py-2.5 font-mono text-sm text-dm-text outline-none placeholder:text-dm-muted focus:border-dm-electric"
          />
          <button
            type="submit"
            className="rounded-none border-[3px] border-dm-accent bg-dm-accent px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-widest text-dm-accent-ink shadow-[4px_4px_0_0_var(--dm-border-strong)] disabled:opacity-60"
          >
            <SubmitPending idle="Commit name" />
          </button>
        </form>

        <form
          action={uploadProfileAvatar}
          encType="multipart/form-data"
          className="mt-8 flex flex-wrap items-end gap-4 border-t-[3px] border-dm-electric/30 pt-8"
        >
          <input type="hidden" name="household_id" value={householdId} />
          <div className="min-w-0 flex-1">
            <label
              htmlFor="avatar"
              className="block font-mono text-[10px] font-black uppercase tracking-widest text-dm-muted"
            >
              Telemetry portrait
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-3 block w-full max-w-xs text-[11px] text-dm-muted file:mr-3 file:border-[3px] file:border-dm-electric file:bg-dm-bg file:px-3 file:py-2 file:font-mono file:text-[10px] file:font-black file:uppercase file:tracking-wide file:text-dm-text"
            />
          </div>
          <button
            type="submit"
            className="rounded-none border-[3px] border-dm-border-strong bg-dm-elevated px-5 py-2.5 font-mono text-[10px] font-black uppercase tracking-widest text-dm-text shadow-[4px_4px_0_0_var(--dm-electric)]"
          >
            <SubmitPending idle="Pump photo" />
          </button>
        </form>
      </section>

      <div>
        <h3 className="font-mono text-[10px] font-black uppercase tracking-[0.2em] text-dm-muted">
          Everyone here
        </h3>
        <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-dm-muted">
          {members.length} node{members.length === 1 ? "" : "s"} · mesh graph
        </p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {sorted.map((m) => (
            <li key={m.userId}>
              <article className="group flex gap-4 border-[3px] border-dm-border-strong bg-dm-surface p-5 shadow-[4px_4px_0_0_var(--dm-electric)] transition hover:-translate-y-px">
                <div className="relative shrink-0">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Supabase CDN
                    <img
                      src={m.avatarUrl}
                      alt=""
                      className="h-14 w-14 rounded-none border-[3px] border-dm-electric object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-none border-[3px] border-dm-electric bg-dm-accent font-mono text-sm font-black text-dm-accent-ink"
                      aria-hidden
                    >
                      {labelForMember(m).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {m.userId === currentUserId ? (
                    <span className="absolute -bottom-1 -right-1 border-[2px] border-dm-border-strong bg-dm-electric px-1.5 py-0.5 font-mono text-[8px] font-black uppercase text-white">
                      You
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-dm-text">
                    {labelForMember(m)}
                  </p>
                  <p className="mt-2 text-[11px] font-mono capitalize text-dm-muted">
                    <span className="inline-flex border-[2px] border-dm-muted/40 px-2 py-0.5 font-semibold uppercase text-dm-muted">
                      {m.role}
                    </span>
                    <span className="mx-2 opacity-40">/</span>
                    Joined {formatJoined(m.joinedAt)}
                  </p>
                </div>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
