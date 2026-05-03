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
  return <>{pending ? "Saving…" : idle}</>;
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
      <section className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-5 sm:p-6">
        <h3 className="text-sm font-medium text-dm-text">Your profile</h3>
        <p className="mt-1 text-[13px] text-dm-muted">
          Display name and optional avatar for this household.
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
            placeholder="Name as it should read on receipts"
            defaultValue={
              sorted.find((x) => x.userId === currentUserId)?.displayName ?? ""
            }
            className="min-w-[12rem] flex-1 rounded-xl border border-[var(--dm-border-strong)] bg-dm-bg/80 px-4 py-2.5 text-sm text-dm-text outline-none focus:border-dm-electric focus:ring-2 focus:ring-dm-electric/15"
          />
          <button
            type="submit"
            className="rounded-md bg-dm-electric px-5 py-2.5 text-sm font-medium text-[var(--dm-accent-ink)] hover:brightness-105"
          >
            <SubmitPending idle="Save" />
          </button>
        </form>

        <form
          action={uploadProfileAvatar}
          encType="multipart/form-data"
          className="mt-8 flex flex-wrap items-end gap-4 border-t border-[var(--dm-border)] pt-8"
        >
          <input type="hidden" name="household_id" value={householdId} />
          <div className="min-w-0 flex-1">
            <label
              htmlFor="avatar"
              className="block text-xs font-semibold uppercase tracking-wide text-dm-muted"
            >
              Photo
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-2 block w-full max-w-xs text-xs text-dm-muted file:mr-3 file:rounded-lg file:border file:border-[var(--dm-border-strong)] file:bg-dm-bg file:px-3 file:py-2 file:text-sm file:font-medium file:text-dm-text"
            />
          </div>
          <button
            type="submit"
            className="rounded-full border border-[var(--dm-border-strong)] bg-dm-surface px-6 py-2.5 text-sm font-semibold text-dm-text shadow-sm hover:border-dm-electric"
          >
            <SubmitPending idle="Upload" />
          </button>
        </form>
      </section>

      <div>
        <h3 className="text-sm font-medium text-dm-text">Members</h3>
        <p className="mt-1 text-[12px] text-dm-muted">{members.length} total.</p>
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {sorted.map((m) => (
            <li key={m.userId}>
              <article className="flex gap-4 rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-4">
                <div className="relative shrink-0">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- Supabase CDN
                    <img
                      src={m.avatarUrl}
                      alt=""
                      className="h-14 w-14 rounded-2xl object-cover ring-1 ring-[var(--dm-border)]"
                    />
                  ) : (
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dm-accent-soft)] text-sm font-semibold text-dm-accent-ink"
                      aria-hidden
                    >
                      {labelForMember(m).slice(0, 2).toUpperCase()}
                    </div>
                  )}
                  {m.userId === currentUserId ? (
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-dm-electric px-2 py-0.5 text-[10px] font-semibold uppercase text-white shadow-sm">
                      You
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-dm-text">
                    {labelForMember(m)}
                  </p>
                  <p className="mt-2 text-[13px] text-dm-muted capitalize">
                    <span className="rounded-full bg-dm-bg px-2 py-0.5 text-xs font-medium">
                      {m.role}
                    </span>
                    <span className="mx-2 opacity-35">·</span>
                    joined {formatJoined(m.joinedAt)}
                    <span className="mx-2 opacity-35">·</span>
                    <span className="inline-flex rounded-md bg-[color-mix(in_srgb,var(--dm-fun)_20%,transparent)] px-1.5 py-px text-[11px] font-semibold tabular-nums text-dm-text ring-1 ring-[var(--dm-border)]">
                      {m.rewardPoints} pts
                    </span>
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
