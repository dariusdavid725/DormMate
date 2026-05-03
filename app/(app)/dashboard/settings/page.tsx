import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

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
