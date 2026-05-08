"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import {
  type AvatarUploadState,
  type ProfileDetailsState,
  updateProfileDetails,
  uploadProfileAvatar,
} from "@/lib/profiles/actions";
import { AVATAR_MAX_BYTES } from "@/lib/profiles/avatar-mime";
import {
  assignAvatarFileToInput,
  clearFileInput,
} from "@/lib/profiles/avatar-input";

type ProfileSeed = {
  displayName: string;
  pronouns: string;
  genderIdentity: string;
  bio: string;
  dietaryPreferences: string[];
  avatarUrl?: string | null;
};

const DIETARY = [
  { id: "vegan", label: "Vegan" },
  { id: "vegetarian", label: "Vegetarian" },
  { id: "pescatarian", label: "Pescatarian" },
  { id: "halal", label: "Halal" },
  { id: "kosher", label: "Kosher" },
  { id: "lactose_free", label: "Lactose free" },
  { id: "gluten_free", label: "Gluten free" },
  { id: "nut_allergy", label: "Nut allergy" },
  { id: "none", label: "No specific preference" },
] as const;

function SubmitDetails({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Saving..." : idle;
}

function AvatarSubmitIdle({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Uploading…" : idle;
}

export function AccountPreferencesForm({
  profile,
}: {
  profile: ProfileSeed;
}) {
  const router = useRouter();
  const galleryRef = useRef<HTMLInputElement>(null);
  const mobileGalleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const avatarSubmitRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasPendingAvatar, setHasPendingAvatar] = useState(false);
  const [avatarClientErr, setAvatarClientErr] = useState<string | null>(null);
  const [state, formAction] = useActionState<ProfileDetailsState, FormData>(
    updateProfileDetails,
    {},
  );
  const [avatarState, avatarFormAction] = useActionState<
    AvatarUploadState,
    FormData
  >(uploadProfileAvatar, {});
  const [avatarSavedFlash, setAvatarSavedFlash] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (!avatarState.ok) return;
    setAvatarSavedFlash(true);
    router.refresh();
    clearAvatarSelection();
    const tid = window.setTimeout(() => setAvatarSavedFlash(false), 3500);
    return () => window.clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- avatar ok + refresh sync
  }, [avatarState.ok, router]);

  async function onAvatarChange(file: File | null | undefined) {
    if (!file) return;
    setAvatarClientErr(null);
    const { resolveAvatarMime } = await import("@/lib/profiles/avatar-mime");

    if (file.size > AVATAR_MAX_BYTES) {
      setAvatarClientErr("This image is too large. Maximum size is 5MB.");
      return;
    }
    const mime = await resolveAvatarMime(file);
    if (!mime) {
      setAvatarClientErr("This file type is not supported.");
      return;
    }

    setHasPendingAvatar(true);
    assignAvatarFileToInput(file, avatarSubmitRef.current);

    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }

  function clearAvatarSelection() {
    setHasPendingAvatar(false);
    setAvatarClientErr(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    clearFileInput(galleryRef.current);
    clearFileInput(mobileGalleryRef.current);
    clearFileInput(cameraRef.current);
    clearFileInput(avatarSubmitRef.current);
  }

  return (
    <div className="space-y-8">
      <form action={formAction} className="space-y-4">
        {state.error ? (
          <p className="rounded-md border border-dm-danger/40 px-3 py-2 text-sm text-dm-danger">
            {state.error}
          </p>
        ) : null}
        {state.ok ? (
          <p className="rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-sm text-dm-muted">
            Profile saved.
          </p>
        ) : null}

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Display name
          </span>
          <input
            type="text"
            name="display_name"
            maxLength={80}
            defaultValue={profile.displayName}
            className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm"
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
              Pronouns
            </span>
            <input
              type="text"
              name="pronouns"
              maxLength={40}
              placeholder="she/her, he/him, they/them..."
              defaultValue={profile.pronouns}
              className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
              Gender
            </span>
            <select
              name="gender_identity"
              defaultValue={profile.genderIdentity}
              className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm"
            >
              <option value="">Prefer not to say</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="non_binary">Non-binary</option>
              <option value="other">Other</option>
            </select>
          </label>
        </div>

        <fieldset className="space-y-2">
          <legend className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Food profile (helps split receipts smarter)
          </legend>
          <div className="flex flex-wrap gap-3">
            {DIETARY.map((x) => (
              <label key={x.id} className="inline-flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  name="dietary_preferences"
                  value={x.id}
                  defaultChecked={profile.dietaryPreferences.includes(x.id)}
                />
                <span>{x.label}</span>
              </label>
            ))}
          </div>
        </fieldset>

        <label className="block">
          <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Bio
          </span>
          <textarea
            name="bio"
            maxLength={300}
            rows={3}
            defaultValue={profile.bio}
            placeholder="What people should know when splitting chores/bills..."
            className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm"
          />
        </label>

        <button className="rounded-md bg-dm-electric px-4 py-2 text-sm font-semibold text-white">
          <SubmitDetails idle="Save profile" />
        </button>
      </form>

      <form
        action={avatarFormAction}
        encType="multipart/form-data"
        className="space-y-3 border-t border-[var(--dm-border)] pt-6"
      >
        <input ref={avatarSubmitRef} type="file" name="avatar" tabIndex={-1} aria-hidden className="sr-only" />
        <p className="block text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Avatar photo
        </p>
        {(avatarClientErr ?? avatarState.error) ? (
          <p role="alert" className="rounded-md border border-dm-danger/40 px-3 py-2 text-sm text-dm-danger">
            {avatarClientErr ?? avatarState.error}
          </p>
        ) : null}
        {avatarSavedFlash ?
          <p className="rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-sm text-dm-muted">
            Avatar updated.
          </p>
        : null}

        <div className="flex gap-4">
          {previewUrl ?
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img
              src={previewUrl}
              alt="Avatar preview"
              className="h-20 w-20 shrink-0 rounded-2xl border border-[var(--dm-border-strong)] object-cover"
            />
          : profile.avatarUrl ?
            // eslint-disable-next-line @next/next/no-img-element -- persisted avatar URL
            <img
              src={profile.avatarUrl}
              alt="Your current avatar"
              className="h-20 w-20 shrink-0 rounded-2xl border border-[var(--dm-border-strong)] object-cover"
            />
          : (
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl border border-dashed border-[var(--dm-border-strong)] bg-dm-bg/50 text-[11px] text-dm-muted">
              No photo yet
            </div>
          )}
          <div className="min-w-0 flex-1 space-y-2">
            <p className="text-xs text-dm-muted">
              Select JPEG, PNG, or WebP — up to 5MB. Your current avatar stays visible until the new upload succeeds.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => mobileGalleryRef.current?.click()}
                className="min-h-[44px] rounded-md border border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-text touch-manipulation sm:hidden max-sm:flex-1"
              >
                Choose from gallery
              </button>
              <button
                type="button"
                onClick={() => cameraRef.current?.click()}
                className="min-h-[44px] rounded-md bg-dm-electric px-4 py-2 text-xs font-semibold text-white touch-manipulation sm:hidden max-sm:flex-1"
              >
                Take photo
              </button>
              <label className="hidden min-h-[44px] cursor-pointer items-center rounded-md border border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-text touch-manipulation sm:inline-flex">
                Upload from computer
                <input
                  ref={galleryRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  onChange={(e) => onAvatarChange(e.target.files?.[0])}
                />
              </label>
            </div>
          </div>
        </div>
        <input
          ref={mobileGalleryRef}
          type="file"
          accept="image/*"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            void onAvatarChange(e.target.files?.[0]);
          }}
          aria-hidden
        />
        <input
          ref={cameraRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          tabIndex={-1}
          onChange={(e) => {
            void onAvatarChange(e.target.files?.[0]);
          }}
          aria-hidden
        />

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={!hasPendingAvatar}
            className="min-h-[44px] rounded-md border border-[var(--dm-border-strong)] px-5 py-2 text-sm font-semibold text-dm-text disabled:opacity-50 touch-manipulation"
          >
            <AvatarSubmitIdle idle="Save avatar" />
          </button>
          <button
            type="button"
            onClick={clearAvatarSelection}
            className="min-h-[44px] rounded-md px-4 py-2 text-xs font-semibold text-dm-muted hover:text-dm-text touch-manipulation"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}
