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
      <section className="rounded-2xl border border-teal-200/80 bg-white p-6 shadow-sm ring-1 ring-teal-600/10">
        <h3 className="text-sm font-semibold text-stone-900">Your profile</h3>
        <p className="mt-1 text-xs text-stone-500">
          Visible to people in this household. Photos use a shared album-style
          layout — keep it casual.
        </p>
        <form action={updateProfileDisplayName} className="mt-5 flex flex-wrap gap-3">
          <input type="hidden" name="household_id" value={householdId} />
          <label className="sr-only" htmlFor="display_name">
            Display name
          </label>
          <input
            id="display_name"
            name="display_name"
            type="text"
            maxLength={80}
            placeholder="How you want to appear"
            defaultValue={
              sorted.find((x) => x.userId === currentUserId)?.displayName ?? ""
            }
            className="min-w-[12rem] flex-1 rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm text-stone-900 outline-none ring-teal-600/0 transition placeholder:text-stone-400 focus:border-teal-300 focus:ring-2 focus:ring-teal-600/20"
          />
          <button
            type="submit"
            className="rounded-lg bg-teal-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-teal-800 disabled:opacity-60"
          >
            <SubmitPending idle="Save name" />
          </button>
        </form>

        <form
          action={uploadProfileAvatar}
          encType="multipart/form-data"
          className="mt-6 flex flex-wrap items-end gap-3 border-t border-stone-100 pt-6"
        >
          <input type="hidden" name="household_id" value={householdId} />
          <div className="min-w-0 flex-1">
            <label
              htmlFor="avatar"
              className="block text-xs font-medium text-stone-600"
            >
              Profile photo
            </label>
            <input
              id="avatar"
              name="avatar"
              type="file"
              accept="image/jpeg,image/png,image/webp,image/gif"
              className="mt-2 block w-full max-w-xs text-xs text-stone-600 file:mr-3 file:rounded-md file:border file:border-stone-200 file:bg-stone-50 file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-stone-700 hover:file:bg-stone-100"
            />
          </div>
          <button
            type="submit"
            className="rounded-lg border border-stone-200 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50"
          >
            <SubmitPending idle="Upload" />
          </button>
        </form>
      </section>

      <div>
        <h3 className="text-sm font-semibold text-stone-900">Everyone here</h3>
        <p className="mt-1 text-xs text-stone-500">
          {members.length} member{members.length === 1 ? "" : "s"} in this space.
        </p>
        <ul className="mt-6 grid gap-4 sm:grid-cols-2">
          {sorted.map((m) => (
            <li key={m.userId}>
              <article className="group flex gap-4 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition duration-200 hover:border-stone-300 hover:shadow-md">
                <div className="relative shrink-0">
                  {m.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element -- dynamic Supabase public URLs
                    <img
                      src={m.avatarUrl}
                      alt=""
                      className="h-14 w-14 rounded-full object-cover shadow-sm ring-2 ring-white"
                    />
                  ) : (
                    <div
                      className="flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-teal-600 to-teal-800 text-sm font-semibold text-white shadow-sm"
                      aria-hidden
                    >
                      {labelForMember(m)
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>
                  )}
                  {m.userId === currentUserId ? (
                    <span className="absolute -bottom-1 -right-1 rounded-full bg-teal-600 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wide text-white shadow">
                      You
                    </span>
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-semibold text-stone-900">
                    {labelForMember(m)}
                  </p>
                  <p className="mt-1 text-xs capitalize text-stone-500">
                    <span className="inline-flex rounded-md bg-stone-100 px-2 py-0.5 font-medium text-stone-700">
                      {m.role}
                    </span>
                    <span className="mx-2 text-stone-300">·</span>
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
