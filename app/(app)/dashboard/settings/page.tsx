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
    <div className="mx-auto max-w-xl space-y-10 pb-[7rem] lg:pb-10">
      <header className="border-b-[3px] border-dm-electric pb-6">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-dm-muted">
          cockpit meta
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-dm-text">
          Settings
        </h1>
      </header>

      <section className="border-[3px] border-dm-border-strong bg-dm-surface p-6 shadow-[5px_5px_0_0_var(--dm-electric)]">
        <p className="font-mono text-[10px] font-black uppercase text-dm-muted">
          Signed in
        </p>
        <p className="mt-3 break-all font-mono text-sm font-semibold text-dm-text">
          {user.email}
        </p>
        <p className="mt-4 text-xs text-dm-muted">
          Appearance follows your OS lighting — bleumarin night mode activates
          automatically for OLED dorms.
        </p>
      </section>

      <div className="flex flex-wrap gap-4">
        <Link
          href="/dashboard"
          className="border-[3px] border-dm-electric px-6 py-3 font-mono text-[11px] font-black uppercase tracking-widest text-dm-electric shadow-[4px_4px_0_0_var(--dm-border-strong)]"
        >
          Pulse
        </Link>
        <Link
          href="/privacy"
          className="border-[3px] border-transparent px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-dm-muted underline"
        >
          Privacy
        </Link>
        <Link
          href="/terms"
          className="border-[3px] border-transparent px-4 py-3 font-mono text-[11px] font-bold uppercase tracking-wide text-dm-muted underline"
        >
          Terms
        </Link>
      </div>
    </div>
  );
}
