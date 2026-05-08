"use client";

import { useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import type { HouseholdMemberRow } from "@/lib/households/queries";
import {
  promoteHouseholdMemberToAdmin,
  removeHouseholdMember,
} from "@/lib/households/actions";
import { RegenerateInviteButton } from "@/components/household/regenerate-invite-form";
import {
  updateProfileDisplayName,
  uploadProfileAvatar,
} from "@/lib/profiles/actions";
import { getSiteUrl } from "@/lib/site-url";

function formatJoined(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
    }).format(new Date(iso));
  } catch {
    return "—";
  }
}

function labelHeadline(m: HouseholdMemberRow) {
  if (m.displayName?.trim()) return m.displayName.trim();
  if (m.email?.trim()) return m.email.trim();
  return `Member · ${m.userId.slice(0, 8)}`;
}

function SubmitPending({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return <>{pending ? "Saving…" : idle}</>;
}

export function HouseholdMembersPanel({
  members,
  currentUserId,
  householdId,
  inviteCode,
  canManageInvites,
  householdCreatorId,
  currentRole,
}: {
  members: HouseholdMemberRow[];
  currentUserId: string;
  householdId: string;
  inviteCode: string | null;
  canManageInvites: boolean;
  householdCreatorId: string;
  currentRole: string;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const mobileGalleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasPendingAvatar, setHasPendingAvatar] = useState(false);
  const sorted = [...members].sort((a, b) => {
    if (a.userId === currentUserId) return -1;
    if (b.userId === currentUserId) return 1;
    return labelHeadline(a).localeCompare(labelHeadline(b));
  });

  const site = getSiteUrl();
  const joinUrl =
    inviteCode?.length ?
      `${site.replace(/\/+$/, "")}/dashboard/join?code=${encodeURIComponent(inviteCode)}`
    : null;

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onAvatarChange(file: File | null | undefined) {
    if (!file) return;
    setHasPendingAvatar(true);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function clearAvatarSelection() {
    setHasPendingAvatar(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    if (galleryRef.current) galleryRef.current.value = "";
    if (mobileGalleryRef.current) mobileGalleryRef.current.value = "";
    if (cameraRef.current) cameraRef.current.value = "";
  }

  return (
    <div className="space-y-10">
      <section className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-5 sm:p-6">
        <h3 className="text-sm font-medium text-dm-text">Your profile</h3>
        <p className="mt-1 text-[13px] text-dm-muted">
          Display name and optional avatar visible to roommates.
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
            placeholder="Name shown to roommates"
            defaultValue={
              sorted.find((x) => x.userId === currentUserId)?.displayName ?? ""
            }
            className="min-w-[12rem] flex-1 rounded-xl border border-[var(--dm-border-strong)] bg-dm-bg/80 px-4 py-2.5 text-sm text-dm-text outline-none focus:border-dm-electric focus:ring-2 focus:ring-dm-electric/15"
          />
          <button
            type="submit"
            className="rounded-md bg-dm-electric px-5 py-2.5 text-sm font-medium text-white hover:brightness-105"
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
            <p className="block text-xs font-semibold uppercase tracking-wide text-dm-muted">
              Photo
            </p>
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
              <img
                src={previewUrl}
                alt="Profile photo preview"
                className="mt-2 h-20 w-20 rounded-2xl border border-[var(--dm-border-strong)] object-cover"
              />
            ) : (
              <p className="mt-2 text-xs text-dm-muted">
                Pick a photo to preview. Upload happens only after Save.
              </p>
            )}
            <div className="sm:hidden mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => mobileGalleryRef.current?.click()}
                className="rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-xs font-semibold text-dm-text"
              >
                Choose gallery
              </button>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="rounded-md bg-dm-electric px-3 py-2 text-xs font-semibold text-white"
              >
                Take photo
              </button>
            </div>
            <input
              ref={mobileGalleryRef}
              name="avatar"
              type="file"
              accept="image/*"
              className="sr-only sm:hidden"
              onChange={(e) => onAvatarChange(e.target.files?.[0])}
            />
            <input
              ref={cameraRef}
              name="avatar"
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => onAvatarChange(e.target.files?.[0])}
            />
            <label className="hidden sm:block mt-2 text-xs text-dm-muted">
              Upload from computer
              <input
                ref={galleryRef}
                name="avatar"
                type="file"
                accept="image/*"
                className="mt-2 block w-full max-w-xs text-xs text-dm-muted file:mr-3 file:rounded-lg file:border file:border-[var(--dm-border-strong)] file:bg-dm-bg file:px-3 file:py-2 file:text-sm file:font-medium file:text-dm-text"
                onChange={(e) => onAvatarChange(e.target.files?.[0])}
              />
            </label>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="submit"
              disabled={!hasPendingAvatar}
              className="rounded-full border border-[var(--dm-border-strong)] bg-dm-surface px-6 py-2.5 text-sm font-semibold text-dm-text shadow-sm hover:border-dm-electric disabled:opacity-50"
            >
              <SubmitPending idle="Save photo" />
            </button>
            <button
              type="button"
              onClick={clearAvatarSelection}
              className="text-xs font-semibold text-dm-muted hover:text-dm-text"
            >
              Clear
            </button>
          </div>
        </form>
      </section>

      {canManageInvites ? (
        <section className="cozy-note cozy-tilt-xs p-5 shadow-[var(--cozy-shadow-note)]">
          <h3 className="text-sm font-semibold text-dm-text">Koti invite</h3>
          <p className="mt-2 text-[12px] text-dm-muted">
            Share this link with roommates to join this Koti home.
          </p>
          {inviteCode?.length ?
            <>
              <p className="mt-4 rounded-md bg-dm-surface px-3 py-2 font-mono text-sm tracking-[0.06em] text-dm-text">
                {inviteCode}
              </p>
              {joinUrl ?
                <p className="mt-2 break-all text-[12px] text-dm-muted">
                  <span className="font-semibold text-dm-text">Link:</span> {joinUrl}
                </p>
              : null}
            </>
          : (
            <p className="mt-4 text-[13px] text-dm-danger">
              Invite code missing — run the latest migration in SQL.
            </p>
          )}
          <RegenerateInviteButton householdId={householdId} />
        </section>
      ) : null}

      <div>
        <h3 className="text-sm font-medium text-dm-text">Roommates</h3>
        <p className="mt-1 text-[12px] text-dm-muted">{members.length} roommates total.</p>
        {members.length === 0 ? (
          <p className="mt-4 rounded-md border border-dashed border-[var(--dm-border-strong)] px-3 py-3 text-[13px] text-dm-muted">
            It&apos;s quiet here. Invite your roommates to make this home useful.
          </p>
        ) : null}
        <ul className="mt-8 grid gap-4 sm:grid-cols-2">
          {sorted.map((m) => {
            const isYou = m.userId === currentUserId;
            const canRemoveOthers =
              (currentRole === "owner" || currentRole === "admin") && !isYou && m.role !== "owner";

            const canPromoteMember =
              householdCreatorId === currentUserId &&
              currentUserId !== m.userId &&
              m.role === "member";

            return (
              <li key={m.userId}>
                <article className="flex gap-4 rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-4">
                  <div className="relative shrink-0">
                    {m.avatarUrl ?
                      // eslint-disable-next-line @next/next/no-img-element -- CDN
                      <img
                        src={m.avatarUrl}
                        alt=""
                        className="h-14 w-14 rounded-2xl object-cover ring-1 ring-[var(--dm-border)]"
                      />
                    : (
                      <div
                        className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dm-accent-soft)] text-sm font-semibold text-dm-accent-ink"
                        aria-hidden
                      >
                        {labelHeadline(m).slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {isYou ?
                      <span className="absolute -bottom-1 -right-1 rounded-full bg-dm-electric px-2 py-0.5 text-[10px] font-semibold uppercase text-white shadow-sm">
                        You
                      </span>
                    : null}
                  </div>
                  <div className="min-w-0 flex-1 space-y-2">
                    <p className="truncate font-semibold text-dm-text">
                      {labelHeadline(m)}
                    </p>
                    {m.email?.trim() && m.email !== labelHeadline(m) ?
                      <p className="truncate text-[12px] text-dm-muted">{m.email}</p>
                    : null}
                    <p className="text-[13px] text-dm-muted capitalize">
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

                    <div className="flex flex-wrap gap-2 pt-1">
                      {canPromoteMember ?
                        <form action={promoteHouseholdMemberToAdmin}>
                          <input type="hidden" name="household_id" value={householdId} />
                          <input type="hidden" name="target_user_id" value={m.userId} />
                          <button
                            type="submit"
                            className="rounded-md border border-[var(--dm-border-strong)] px-3 py-1.5 text-[11px] font-semibold text-dm-muted hover:border-dm-electric hover:text-dm-electric"
                          >
                            Promote admin
                          </button>
                        </form>
                      : null}
                      {(canRemoveOthers || (isYou && m.role !== "owner")) ?
                        <form action={removeHouseholdMember}>
                          <input type="hidden" name="household_id" value={householdId} />
                          <input type="hidden" name="target_user_id" value={m.userId} />
                          <button
                            type="submit"
                            className="rounded-md px-3 py-1.5 text-[11px] font-semibold text-dm-danger hover:underline"
                          >
                            {isYou ? "Leave flat" : "Remove"}
                          </button>
                        </form>
                      : null}
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
