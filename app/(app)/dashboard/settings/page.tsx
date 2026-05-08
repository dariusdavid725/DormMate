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
    <div className="mx-auto max-w-xl space-y-8 pb-24 max-lg:space-y-7 lg:space-y-9 lg:pb-9">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-5 lg:pb-6">
        <h1 className="font-cozy-display text-[2rem] leading-[1.1] text-dm-text max-lg:tracking-tight lg:text-[2.35rem]">
          Your nook
        </h1>
      </header>

      <section className="dm-card-surface cozy-tilt-xs-alt p-5 max-lg:rounded-2xl max-lg:p-4">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
          Account
        </p>
        <p className="mt-4 break-all text-[15px] font-semibold leading-snug text-dm-text lg:text-sm">
          {user.email}
        </p>
        <p className="mt-4 hidden text-[14px] leading-relaxed text-dm-muted lg:block lg:text-[13px]">
          Warm corkboard aesthetic — readable type, cozy colors.
        </p>
      </section>

      <section className="cozy-poster cozy-tilt-xs p-5 max-lg:rounded-2xl max-lg:p-4">
        <h2 className="font-cozy-display text-[1.65rem] text-dm-text lg:text-2xl">
          Account profile
        </h2>
        <p className="mt-2 hidden text-[14px] leading-snug text-dm-muted lg:block lg:text-[13px]">
          Works on both mobile and desktop. Set preferences to make splits more relevant.
        </p>
        <div className="mt-5 max-lg:[&_button]:min-h-[48px] max-lg:[&_input]:min-h-[48px] max-lg:[&_input]:text-[16px] max-lg:[&_select]:min-h-[48px] max-lg:[&_textarea]:min-h-[100px] max-lg:[&_textarea]:text-[16px]">
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

      <div className="flex flex-col gap-3 max-lg:w-full sm:flex-row sm:flex-wrap">
        <Link
          href="/dashboard"
          className="dm-btn-primary dm-hover-tap !text-sm max-lg:flex max-lg:min-h-[48px] max-lg:w-full max-lg:items-center max-lg:justify-center sm:max-lg:w-auto sm:max-lg:min-w-[8rem]"
        >
          Home
        </Link>
        <Link
          href="/privacy"
          className="dm-btn-secondary dm-hover-tap !text-sm max-lg:flex max-lg:min-h-[48px] max-lg:flex-1 max-lg:items-center max-lg:justify-center"
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className="dm-btn-secondary dm-hover-tap !text-sm max-lg:flex max-lg:min-h-[48px] max-lg:flex-1 max-lg:items-center max-lg:justify-center"
        >
          Terms
        </Link>
      </div>
    </div>
  );
}
