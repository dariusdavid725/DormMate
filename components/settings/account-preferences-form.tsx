"use client";

import { useActionState } from "react";
import { useFormStatus } from "react-dom";

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
  const [state, formAction] = useActionState<ProfileDetailsState, FormData>(
    updateProfileDetails,
    {},
  );

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
        <label className="block text-xs font-semibold uppercase tracking-wide text-dm-muted">
          Avatar photo
          <input
            type="file"
            name="avatar"
            accept="image/*"
            capture="environment"
            className="mt-2 block w-full max-w-xs text-xs text-dm-muted file:mr-3 file:rounded-lg file:border file:border-[var(--dm-border-strong)] file:bg-dm-bg file:px-3 file:py-2 file:text-sm file:font-medium file:text-dm-text"
          />
        </label>
        <button
          type="submit"
          className="rounded-md border border-[var(--dm-border-strong)] px-4 py-2 text-sm font-semibold text-dm-text"
        >
          <Submit idle="Upload avatar" />
        </button>
      </form>
    </div>
  );
}

