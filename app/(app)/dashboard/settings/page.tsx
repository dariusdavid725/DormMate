import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { AccountPreferencesForm } from "@/components/settings/account-preferences-form";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Settings",
};

export default async function SettingsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/settings");
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name, pronouns, gender_identity, dietary_preferences, bio")
    .eq("id", user.id)
    .maybeSingle();

  const p = (profile ?? {}) as {
    display_name?: string | null;
    pronouns?: string | null;
    gender_identity?: string | null;
    dietary_preferences?: string[] | null;
    bio?: string | null;
  };

  return (
    <div className="mx-auto max-w-xl space-y-9 pb-24 lg:pb-9">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-6">
        <h1 className="font-cozy-display text-[2.35rem] text-dm-text leading-[1.1]">
          Your nook
        </h1>
      </header>

      <section className="dm-card-surface cozy-tilt-xs-alt p-5">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
          Account
        </p>
        <p className="mt-4 break-all text-sm font-semibold text-dm-text">{user.email}</p>
        <p className="mt-4 text-[13px] text-dm-muted">
          Warm corkboard aesthetic — readable type, cozy colors.
        </p>
      </section>

      <section className="cozy-poster cozy-tilt-xs p-5">
        <h2 className="font-cozy-display text-2xl text-dm-text">Account profile</h2>
        <p className="mt-2 text-[13px] text-dm-muted">
          Works on both mobile and desktop. Set preferences to make splits more relevant.
        </p>
        <div className="mt-5">
          <AccountPreferencesForm
            profile={{
              displayName: p.display_name ?? "",
              pronouns: p.pronouns ?? "",
              genderIdentity: p.gender_identity ?? "",
              bio: p.bio ?? "",
              dietaryPreferences: Array.isArray(p.dietary_preferences)
                ? p.dietary_preferences
                : [],
            }}
          />
        </div>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link href="/dashboard" className="dm-btn-primary dm-hover-tap !text-sm">
          Home
        </Link>
        <Link
          href="/privacy"
          className="dm-btn-secondary dm-hover-tap !text-sm"
        >
          Privacy
        </Link>
        <Link href="/terms" className="dm-btn-secondary dm-hover-tap !text-sm">
          Terms
        </Link>
      </div>
    </div>
  );
}
