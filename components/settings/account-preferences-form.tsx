"use client";

import { useActionState, useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";

import { AvatarUploadFormBlock } from "@/components/profile/avatar-upload-form-block";
import {
  type AvatarUploadState,
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
  avatarUrl?: string | null;
  phoneNumber?: string;
  iban?: string;
  paymentNote?: string;
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

export function AccountPreferencesForm({
  profile,
}: {
  profile: ProfileSeed;
}) {
  const router = useRouter();
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
    if (!avatarState.ok) return;
    setAvatarSavedFlash(true);
    router.refresh();
    const tid = window.setTimeout(() => setAvatarSavedFlash(false), 3500);
    return () => window.clearTimeout(tid);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- refresh on successful avatar upload only
  }, [avatarState.ok, router]);

  useEffect(() => {
    if (!state.ok) return;
    router.refresh();
  }, [state.ok, router]);

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

        <div className="space-y-3 border-t border-[var(--dm-border)] pt-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
            Pay roommates back
          </p>
          <p className="text-[12px] text-dm-muted">
            Only people in your homes can see these. IBAN is stored without spaces.
          </p>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
              Phone (Revolut, bank SMS, etc.)
            </span>
            <input
              type="text"
              name="phone_number"
              maxLength={40}
              defaultValue={profile.phoneNumber ?? ""}
              autoComplete="tel"
              className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
              IBAN
            </span>
            <input
              type="text"
              name="iban"
              maxLength={48}
              defaultValue={profile.iban ?? ""}
              spellCheck={false}
              className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 font-mono text-sm uppercase"
            />
          </label>
          <label className="block">
            <span className="text-xs font-semibold uppercase tracking-wide text-dm-muted">
              Payment note (optional)
            </span>
            <input
              type="text"
              name="payment_note"
              maxLength={200}
              defaultValue={profile.paymentNote ?? ""}
              placeholder="e.g. Name on account, reference to use"
              className="mt-2 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-3 py-2.5 text-sm"
            />
          </label>
        </div>

        <button className="rounded-md bg-dm-electric px-4 py-2 text-sm font-semibold text-white">
          <SubmitDetails idle="Save profile" />
        </button>
      </form>

      <AvatarUploadFormBlock
        formAction={avatarFormAction}
        avatarState={avatarState}
        currentAvatarUrl={profile.avatarUrl ?? null}
        legend="Avatar photo"
        variant="settings"
        successFlash={avatarSavedFlash}
      />
    </div>
  );
}
