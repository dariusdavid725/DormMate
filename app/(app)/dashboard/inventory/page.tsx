import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Grocery",
};

export default async function InventoryPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/login?next=/dashboard/inventory");
  }

  return (
    <div className="mx-auto max-w-xl space-y-7 pb-24 lg:pb-9">
      <header className="border-b border-[var(--dm-border-strong)] pb-6">
        <p className="text-[11px] font-black uppercase tracking-[0.26em] text-dm-accent">
          Pantry vibes
        </p>
        <h1 className="mt-1.5 text-[2rem] font-black tracking-tight text-dm-text">
          Groceries beta
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-dm-muted">
          Receipts whisper what runs low · future-you won&apos;t yell about vanished oat milk again.
        </p>
      </header>

      <div className="dm-card-surface dm-card-interactive rounded-[1.35rem] p-7 ring-1 ring-[color-mix(in_srgb,var(--dm-accent)_22%,transparent)]">
        <p className="text-sm font-black text-dm-text">Quietly assembling 🛒✨</p>
        <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
          Staples radar + roommate-safe nudges queue behind sharper receipt intel — chaotic good for shared kitchens incoming.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex text-sm font-bold text-dm-electric underline decoration-dm-electric/45 underline-offset-2 hover:text-dm-text hover:decoration-dm-text/40"
      >
        ← Back to HQ
      </Link>
    </div>
  );
}
