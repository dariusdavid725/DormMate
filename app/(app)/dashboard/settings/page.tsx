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
      <header className="border-b border-[var(--dm-border-strong)] pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
          Account
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-dm-text">
          You
        </h1>
      </header>

      <section className="rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/72 p-6 shadow-lg shadow-black/[0.04] backdrop-blur-md">
        <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
          Signed in
        </p>
        <p className="mt-3 break-all text-sm font-medium text-dm-text">
          {user.email}
        </p>
        <p className="mt-5 text-sm leading-relaxed text-dm-muted">
          Theme follows OS lighting — submarine navy after dark saves retinas reviewing rent math.
        </p>
      </section>

      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-dm-electric px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:brightness-110"
        >
          Pulse
        </Link>
        <Link href="/privacy" className="rounded-full px-4 py-2.5 text-sm font-medium text-dm-muted hover:text-dm-electric">
          Privacy
        </Link>
        <Link href="/terms" className="rounded-full px-4 py-2.5 text-sm font-medium text-dm-muted hover:text-dm-electric">
          Terms
        </Link>
      </div>
    </div>
  );
}
