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
      <header className="border-b-[3px] border-dm-electric pb-6">
        <p className="font-mono text-[10px] font-black uppercase tracking-[0.24em] text-dm-muted">
          inventory matrix
        </p>
        <h1 className="mt-2 text-3xl font-black uppercase tracking-tight text-dm-text">
          Grocery
        </h1>
        <p className="mt-3 text-sm text-dm-muted">
          Pantry ontology + low-stock pings — flagged for Pro rollout. Receipt
          SKU hints will hydrate this surface.
        </p>
      </header>

      <div className="border-[3px] border-dm-border-strong bg-dm-accent/15 p-6 shadow-[6px_6px_0_0_var(--dm-electric)]">
        <p className="font-mono text-sm font-black uppercase text-dm-accent-ink">
          Queue position · soon
        </p>
        <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
          You&apos;re early. Tie grocery velocity to roommate habits without shame
          threads — barcode mode included.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 font-mono text-[11px] font-black uppercase tracking-widest text-dm-electric underline"
      >
        ← Pulse
      </Link>
    </div>
  );
}
