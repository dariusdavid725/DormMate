import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileScrollViewport } from "@/components/mobile/mobile-scroll-viewport";
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
    .select(
      "display_name, pronouns, gender_identity, dietary_preferences, bio, avatar_url",
    )
    .eq("id", user.id)
    .maybeSingle();

  const p = (profile ?? {}) as {
    display_name?: string | null;
    pronouns?: string | null;
    gender_identity?: string | null;
    dietary_preferences?: string[] | null;
    bio?: string | null;
    avatar_url?: string | null;
  };

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-xl flex-1 flex-col overflow-hidden lg:block lg:flex-none lg:space-y-9 lg:overflow-visible lg:pb-9">
      <header className="shrink-0 border-b border-dashed border-[var(--dm-border-strong)] pb-3 pt-0.5 lg:pb-6 lg:pt-0">
        <h1 className="font-cozy-display text-[1.55rem] leading-[1.1] tracking-tight text-dm-text lg:text-[2.35rem] lg:tracking-normal">
          Your nook
        </h1>
        <p className="mt-1 line-clamp-1 text-[11px] text-dm-muted lg:hidden">Account & preferences</p>
      </header>

      <MobileScrollViewport className="flex flex-col gap-6 px-0 pb-4 pt-2 lg:flex-none lg:contents lg:gap-0 lg:p-0">
        <section className="dm-card-surface cozy-tilt-xs-alt min-w-0 p-4 max-lg:rounded-2xl lg:p-5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            Account
          </p>
          <p className="mt-3 min-w-0 break-all text-[14px] font-semibold leading-snug text-dm-text lg:mt-4 lg:text-sm">
            {user.email}
          </p>
          <p className="mt-4 hidden text-[14px] leading-relaxed text-dm-muted lg:block lg:text-[13px]">
            Warm corkboard aesthetic — readable type, cozy colors.
          </p>
        </section>

        <section className="cozy-poster cozy-tilt-xs min-w-0 p-4 max-lg:rounded-2xl lg:p-5">
          <h2 className="font-cozy-display text-[1.35rem] text-dm-text lg:text-2xl">Account profile</h2>
          <p className="mt-2 hidden text-[14px] leading-snug text-dm-muted lg:block lg:text-[13px]">
            Works on both mobile and desktop. Set preferences to make splits more relevant.
          </p>
          <div className="mt-4 max-lg:[&_button]:min-h-[48px] max-lg:[&_input]:min-h-[44px] max-lg:[&_input]:text-[16px] max-lg:[&_select]:min-h-[44px] max-lg:[&_textarea]:min-h-[100px] max-lg:[&_textarea]:text-[16px] lg:mt-5">
            <AccountPreferencesForm
              profile={{
                displayName: p.display_name ?? "",
                pronouns: p.pronouns ?? "",
                genderIdentity: p.gender_identity ?? "",
                bio: p.bio ?? "",
                dietaryPreferences: Array.isArray(p.dietary_preferences)
                  ? p.dietary_preferences
                  : [],
                avatarUrl: p.avatar_url ?? null,
              }}
            />
          </div>
        </section>

        <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:flex-wrap">
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
      </MobileScrollViewport>
    </div>
  );
}
