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
        <p className="text-[11px] font-black uppercase tracking-[0.28em] text-dm-muted">
          Account nook
        </p>
        <h1 className="mt-1.5 text-[2rem] font-black tracking-tight text-dm-text">
          You HQ
        </h1>
      </header>

      <section className="dm-card-surface dm-card-interactive rounded-[1.35rem] p-6 lg:p-7">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-dm-muted">
          Signed in sparkle
        </p>
        <p className="mt-4 break-all text-sm font-bold text-dm-text">{user.email}</p>
        <p className="mt-5 text-sm leading-relaxed text-dm-muted">
          DormMate ships in cinematic dark navy — softer on sleepy eyes skim-reading rent math at 00:43.
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
