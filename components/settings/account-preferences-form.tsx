"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRef } from "react";

import {
  type ProfileDetailsState,
  updateProfileDetails,
  uploadProfileAvatar,
} from "@/lib/profiles/actions";

type ProfileSeed = {
  displayName: string;
  pronouns: string;
  genderIdentity: string;
  bio: string;
  dietaryPreferences: string[];
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

function Submit({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Saving..." : idle;
}

export function AccountPreferencesForm({
  profile,
}: {
  profile: ProfileSeed;
}) {
  const galleryRef = useRef<HTMLInputElement>(null);
  const mobileGalleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasPendingAvatar, setHasPendingAvatar] = useState(false);
  const [state, formAction] = useActionState<ProfileDetailsState, FormData>(
    updateProfileDetails,
    {},
  );

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
          <Submit idle="Save profile" />
        </button>
      </form>

      <form action={uploadProfileAvatar} encType="multipart/form-data" className="space-y-3 border-t border-[var(--dm-border)] pt-6">
        <p className="block text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Avatar photo
        </p>
        {previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
          <img
            src={previewUrl}
            alt="Avatar preview"
            className="h-20 w-20 rounded-2xl border border-[var(--dm-border-strong)] object-cover"
          />
        ) : (
          <p className="text-xs text-dm-muted">
            Select a photo to preview. It will upload only after you confirm Save avatar.
          </p>
        )}
        <div className="sm:hidden flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => mobileGalleryRef.current?.click()}
            className="rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-xs font-semibold text-dm-text"
          >
            Choose from gallery
          </button>
          <button
            type="button"
            onClick={() => cameraRef.current?.click()}
            className="rounded-md bg-dm-electric px-3 py-2 text-xs font-semibold text-white"
          >
            Take photo now
          </button>
        </div>
        <input
          ref={mobileGalleryRef}
          type="file"
          name="avatar"
          accept="image/*"
          className="sr-only sm:hidden"
          onChange={(e) => onAvatarChange(e.target.files?.[0])}
        />
        <label className="hidden sm:block text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Upload from computer
          <input
            ref={galleryRef}
            type="file"
            name="avatar"
            accept="image/*"
            className="mt-2 block w-full max-w-xs text-xs text-dm-muted file:mr-3 file:rounded-lg file:border file:border-[var(--dm-border-strong)] file:bg-dm-bg file:px-3 file:py-2 file:text-sm file:font-medium file:text-dm-text"
            onChange={(e) => onAvatarChange(e.target.files?.[0])}
          />
        </label>
        <input
          ref={cameraRef}
          type="file"
          name="avatar"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => onAvatarChange(e.target.files?.[0])}
        />
        <div className="flex flex-wrap items-center gap-2">
          <button
            type="submit"
            disabled={!hasPendingAvatar}
            className="rounded-md border border-[var(--dm-border-strong)] px-4 py-2 text-sm font-semibold text-dm-text disabled:opacity-50"
          >
            <Submit idle="Save avatar" />
          </button>
          <button
            type="button"
            onClick={clearAvatarSelection}
            className="rounded-md px-3 py-2 text-xs font-semibold text-dm-muted hover:text-dm-text"
          >
            Clear
          </button>
        </div>
      </form>
    </div>
  );
}

