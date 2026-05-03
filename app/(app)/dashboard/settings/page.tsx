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
      <header className="border-b border-[var(--dm-border-strong)] pb-6">
        <h1 className="text-2xl font-semibold tracking-tight text-dm-text">
          Settings
        </h1>
      </header>

      <section className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-5">
        <p className="text-[11px] font-medium uppercase tracking-wide text-dm-muted">
          Account
        </p>
        <p className="mt-4 break-all text-sm font-bold text-dm-text">{user.email}</p>
        <p className="mt-4 text-[13px] text-dm-muted">
          Uses a calm dark theme.
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
