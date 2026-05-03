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
    <div className="mx-auto max-w-xl space-y-8 pb-[7rem] lg:pb-10">
      <header className="border-b border-[var(--dm-border-strong)] pb-6">
        <p className="text-xs font-semibold uppercase tracking-wider text-dm-muted">
          Inventory
        </p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-dm-text">
          Groceries
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-dm-muted">
          Pantry optics will merge with receipts so coffee filters don&apos;t silently vanish.
        </p>
      </header>

      <div className="rounded-3xl border border-[var(--dm-border-strong)] bg-gradient-to-b from-[var(--dm-accent-soft)] to-dm-surface/80 p-7 shadow-lg shadow-black/[0.04] backdrop-blur-sm">
        <p className="text-sm font-semibold text-dm-text">Quietly queued</p>
        <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
          Staples radar + roommate-friendly nudges are slotted behind receipt intelligence — boring supply chains done right deserve UI that doesn&apos;t shout.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex text-sm font-semibold text-dm-electric hover:underline"
      >
        ← Back to dashboard
      </Link>
    </div>
  );
}
