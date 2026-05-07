import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Groceries",
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
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-6">
        <h1 className="font-cozy-display text-[2.35rem] text-dm-text leading-[1.1]">
          Groceries list (soon)
        </h1>
        <p className="mt-2 text-[13px] text-dm-muted">
          Shared shopping list — we&apos;ll connect this to receipts in a later update.
        </p>
      </header>

      <div className="cozy-note cozy-tilt-xs p-5 shadow-[var(--cozy-shadow-note)]">
        <p className="text-sm font-medium text-dm-text">Not available yet</p>
        <p className="mt-2 text-[13px] text-dm-muted">
          Inventory will tie into receipt data later.
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
