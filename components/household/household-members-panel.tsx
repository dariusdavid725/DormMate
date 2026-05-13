"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import type { HouseholdMemberRow } from "@/lib/households/queries";
import {
  promoteHouseholdMemberToAdmin,
  removeHouseholdMember,
} from "@/lib/households/actions";
import { AvatarUploadFormBlock } from "@/components/profile/avatar-upload-form-block";
import { CopyTextButton } from "@/components/ui/copy-text-button";
import {
  type AvatarUploadState,
  updateProfileDisplayName,
  uploadProfileAvatar,
} from "@/lib/profiles/actions";
import { RegenerateInviteButton } from "@/components/household/regenerate-invite-form";
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

function prettyRole(role: string) {
  const r = role.toLowerCase();
  if (r === "owner") return "Owner";
  if (r === "admin") return "Admin";
  if (r === "member") return "Member";
  return role;
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
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [avatarSavedFlash, setAvatarSavedFlash] = useState(false);
  const sorted = [...members].sort((a, b) =>
    labelHeadline(a).localeCompare(labelHeadline(b)),
  );
  const me = members.find((m) => m.userId === currentUserId);

  const [avatarState, avatarFormAction] = useActionState<
    AvatarUploadState,
    FormData
  >(uploadProfileAvatar, {});

  const site = getSiteUrl();
  const joinUrl =
    inviteCode?.length ?
      `${site.replace(/\/+$/, "")}/dashboard/join?code=${encodeURIComponent(inviteCode)}`
    : null;

  useEffect(() => {
    if (!avatarState.ok) return;
    setAvatarSavedFlash(true);
    router.refresh();
    const tid = window.setTimeout(() => setAvatarSavedFlash(false), 3500);
    return () => window.clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avatar OK + refresh sync
  }, [avatarState.ok, router]);

  async function copyInviteLink() {
    if (!joinUrl) return;
    try {
      await navigator.clipboard.writeText(joinUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2200);
    } catch {
      setCopied(false);
    }
  }

  const listSection = (
    <section className="min-w-0 space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-cozy-display text-xl leading-tight tracking-tight text-dm-text sm:text-[1.35rem]">
            Roommates
          </h2>
          <p className="mt-1 text-[12px] text-dm-muted">
            {members.length}{" "}
            {members.length === 1 ? "person calls this place home." : "people in this home."}
          </p>
        </div>
        <span className="shrink-0 rounded-full bg-[color-mix(in_srgb,var(--dm-accent)_18%,transparent)] px-3 py-1 text-[11px] font-semibold text-dm-accent-ink ring-1 ring-[var(--dm-border)]">
          {members.filter((m) => m.role === "owner" || m.role === "admin").length}{" "}
          {members.filter((m) => m.role === "owner" || m.role === "admin").length === 1 ? "admin" : "admins"}
        </span>
      </div>
      {members.length === 0 ?
        <div className="rounded-2xl border border-dashed border-[var(--dm-border-strong)] bg-dm-bg/40 px-4 py-10 text-center">
          <p className="text-sm font-semibold text-dm-text">No roommates yet</p>
          <p className="mt-2 text-[13px] leading-relaxed text-dm-muted">
            When someone joins with your invite link, they&apos;ll show up here with you.
          </p>
        </div>
      : (
        <ul className="grid gap-3 sm:grid-cols-2 sm:gap-4">
          {sorted.map((m) => {
            const isYou = m.userId === currentUserId;
            const canRemoveOthers =
              (currentRole === "owner" || currentRole === "admin") &&
              !isYou &&
              m.role !== "owner";

            const canPromoteMember =
              householdCreatorId === currentUserId &&
              currentUserId !== m.userId &&
              m.role === "member";

            return (
              <li key={m.userId}>
                <article className="group relative overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-gradient-to-br from-dm-bg to-dm-bg/80 p-4 shadow-[0_14px_40px_-26px_rgb(15_23_42/0.55)] ring-1 ring-black/[0.03] transition-[transform,box-shadow] hover:-translate-y-0.5 hover:shadow-[0_18px_44px_-24px_rgb(15_23_42/0.45)]">
                  <div className="pointer-events-none absolute -right-6 -top-8 h-24 w-24 rounded-full bg-[color-mix(in_srgb,var(--dm-fun)_22%,transparent)] blur-2xl opacity-70" aria-hidden />
                  <div className="relative flex gap-3">
                    <div className="relative shrink-0">
                      {m.avatarUrl ?
                        // eslint-disable-next-line @next/next/no-img-element -- storage URL
                        <img
                          src={m.avatarUrl}
                          alt=""
                          className="h-14 w-14 rounded-2xl object-cover shadow-sm ring-2 ring-[var(--dm-border)]"
                        />
                      : (
                        <div
                          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[var(--dm-accent-soft)] text-sm font-bold text-dm-accent-ink ring-2 ring-[var(--dm-border)]"
                          aria-hidden
                        >
                          {labelHeadline(m).slice(0, 2).toUpperCase()}
                        </div>
                      )}
                      {isYou ?
                        <span className="absolute -bottom-1 -right-1 rounded-full bg-dm-electric px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white shadow-sm">
                          You
                        </span>
                      : null}
                    </div>
                    <div className="min-w-0 flex-1 space-y-1.5">
                      <p className="truncate font-semibold leading-snug text-dm-text">
                        {labelHeadline(m)}
                      </p>
                      {m.email?.trim() ?
                        <p className="truncate text-[12px] text-dm-muted">{m.email.trim()}</p>
                      : null}
                      {(m.phoneNumber?.trim() || m.iban?.trim()) ?
                        <div className="flex min-w-0 flex-wrap items-center gap-1.5 pt-1">
                          {m.phoneNumber?.trim() ?
                            <>
                              <span className="max-w-[10rem] truncate font-mono text-[11px] text-dm-text">
                                {m.phoneNumber.trim()}
                              </span>
                              <CopyTextButton
                                text={m.phoneNumber.trim()}
                                label="Phone"
                                className="touch-manipulation shrink-0 rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/80 px-2 py-0.5 text-[10px] font-semibold text-dm-text hover:border-dm-electric"
                              />
                            </>
                          : null}
                          {m.iban?.trim() ?
                            <>
                              <span className="max-w-[11rem] truncate font-mono text-[11px] text-dm-text">
                                {m.iban.replace(/\s+/g, " ").trim()}
                              </span>
                              <CopyTextButton
                                text={m.iban.replace(/\s+/g, "").trim()}
                                label="IBAN"
                                className="touch-manipulation shrink-0 rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/80 px-2 py-0.5 text-[10px] font-semibold text-dm-text hover:border-dm-electric"
                              />
                            </>
                          : null}
                        </div>
                      : (
                        <p className="text-[10px] text-dm-muted/80">No payment details yet</p>
                      )}
                      {m.paymentNote?.trim() ?
                        <p className="line-clamp-2 text-[10px] text-dm-muted">{m.paymentNote.trim()}</p>
                      : null}
                      <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-dm-muted">
                        <span className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--dm-electric)_15%,transparent)] px-2.5 py-1 font-semibold text-dm-text">
                          {prettyRole(m.role)}
                        </span>
                        <span aria-hidden className="text-dm-muted/50">
                          ·
                        </span>
                        <span>Joined {formatJoined(m.joinedAt)}</span>
                        <span aria-hidden className="text-dm-muted/50">
                          ·
                        </span>
                        <span className="inline-flex items-center rounded-md bg-dm-bg/90 px-1.5 py-0.5 font-semibold tabular-nums text-dm-text ring-1 ring-[var(--dm-border)]">
                          {m.rewardPoints} pts
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-2 pt-2">
                        {canPromoteMember ?
                          <form action={promoteHouseholdMemberToAdmin}>
                            <input type="hidden" name="household_id" value={householdId} />
                            <input type="hidden" name="target_user_id" value={m.userId} />
                            <button
                              type="submit"
                              className="min-h-[44px] rounded-xl border border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-muted hover:border-dm-electric hover:text-dm-electric touch-manipulation"
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
                              className="min-h-[44px] rounded-xl px-4 py-2 text-xs font-semibold text-dm-danger hover:bg-dm-danger/5 touch-manipulation"
                            >
                              {isYou ? "Leave flat" : "Remove"}
                            </button>
                          </form>
                        : null}
                      </div>
                    </div>
                  </div>
                </article>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );

  const inviteSection =
    canManageInvites ?
      <section className="dm-module dm-module-muted shrink-0 overflow-hidden rounded-2xl p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <h3 className="text-sm font-semibold text-dm-text">Invite roommate</h3>
            <p className="mt-1 text-[11px] leading-snug text-dm-muted">
              Share your link below — newcomers land here as members.
            </p>
          </div>
          {inviteCode?.length ?
            <span className="shrink-0 rounded-full bg-dm-bg px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-dm-muted ring-1 ring-[var(--dm-border)]">
              Active invite
            </span>
          : null}
        </div>

        {inviteCode?.length ?
          <>
            <p className="mt-4 break-all rounded-xl bg-dm-surface px-3 py-2.5 font-mono text-[13px] tracking-[0.04em] text-dm-text">
              {inviteCode}
            </p>
            {joinUrl ?
              <p className="mt-2 line-clamp-2 break-all text-[11px] text-dm-muted">
                Link:{" "}
                <span className="font-medium text-dm-text">{joinUrl}</span>
              </p>
            : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  void copyInviteLink();
                }}
                disabled={!joinUrl}
                className="min-h-[44px] flex-1 rounded-xl bg-dm-electric px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-105 disabled:opacity-50 touch-manipulation sm:flex-none"
              >
                {copied ? "Copied!" : "Copy invite link"}
              </button>
            </div>
          </>
        : (
          <p className="mt-4 text-[13px] text-dm-danger">
            Invite code missing — apply the latest <code className="text-xs font-mono">schema.sql</code> in Supabase,
            then refresh.
          </p>
        )}
        <RegenerateInviteButton householdId={householdId} />
      </section>
    : null;

  const profileSection = (
    <section className="dm-module dm-module-depth shrink-0 overflow-hidden rounded-2xl p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-dm-text">Your profile</h3>
          <p className="mt-1 text-[11px] text-dm-muted">
            How roommates see you in this home (name + photo).
          </p>
        </div>
      </div>
      <form action={updateProfileDisplayName} className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input type="hidden" name="household_id" value={householdId} />
        <label className="sr-only" htmlFor={`display_name_${householdId}`}>
          Display name
        </label>
        <input
          id={`display_name_${householdId}`}
          name="display_name"
          type="text"
          maxLength={80}
          placeholder="Name shown to roommates"
          defaultValue={me?.displayName ?? ""}
          className="min-h-[44px] min-w-[12rem] flex-1 rounded-xl border border-[var(--dm-border-strong)] bg-dm-bg/80 px-4 py-2.5 text-sm text-dm-text outline-none focus:border-dm-electric focus:ring-2 focus:ring-dm-electric/15"
        />
        <button
          type="submit"
          className="min-h-[44px] shrink-0 rounded-xl bg-dm-electric px-5 py-2.5 text-sm font-semibold text-white hover:brightness-105 touch-manipulation"
        >
          <SubmitPending idle="Save name" />
        </button>
      </form>

      <AvatarUploadFormBlock
        formAction={avatarFormAction}
        avatarState={avatarState}
        currentAvatarUrl={me?.avatarUrl ?? null}
        householdId={householdId}
        legend="Photo"
        variant="household"
        successFlash={avatarSavedFlash}
        idleLabel="Save photo"
      />
    </section>
  );

  return (
    <div className="dm-page-enter">
      <div className="flex flex-col gap-8 lg:grid lg:grid-cols-12 lg:items-start lg:gap-10">
        <div className="min-w-0 lg:col-span-7">{listSection}</div>
        <aside className="flex min-w-0 flex-col gap-6 lg:col-span-5">
          {inviteSection}
          {profileSection}
        </aside>
      </div>
    </div>
  );
}
