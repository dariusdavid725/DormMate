import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MobileListItem } from "@/components/mobile/mobile-list-item";
import { MobileSection } from "@/components/mobile/mobile-section";
import { loadHouseholdSummaries } from "@/lib/households/queries";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "More",
};

export default async function DashboardMorePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard/more");
  }

  const { households, error } = await loadHouseholdSummaries(user.id);
  const { data: adminFlag } = await supabase.rpc("is_platform_super_admin");
  const showAdmin = adminFlag === true;

  return (
    <div className="mx-auto w-full max-w-lg space-y-5 pb-6 lg:max-w-2xl lg:pb-10">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-5 lg:pb-6">
        <h1 className="font-cozy-display text-[2rem] leading-tight text-dm-text lg:text-[2.35rem]">
          More
        </h1>
        <p className="mt-2 text-[14px] leading-snug text-dm-muted lg:hidden">
          Homes, settings, and invites.
        </p>
        <p className="mt-2 hidden text-[13px] leading-snug text-dm-muted lg:block">
          Homes, invites, and account — everything beyond the daily tabs.
        </p>
      </header>

      {error ?
        <p className="rounded-xl border border-dm-danger/35 px-4 py-3 text-[13px] text-dm-danger">
          Could not load homes.
        </p>
      : null}

      <MobileSection
        title="Your homes"
        hideDescriptionMobile
        description="Roommates, events, receipts, and rules live on each home page."
        className="lg:border-[var(--dm-border-strong)] lg:shadow-[var(--cozy-shadow-note)]"
      >
        {households.length === 0 ?
          <p className="text-[14px] text-dm-muted">
            Create one from{" "}
            <Link href="/dashboard" className="font-semibold text-dm-electric hover:underline">
              Home
            </Link>
            .
          </p>
        : (
          <ul className="flex flex-col gap-2">
            {households.map((h) => (
              <li key={h.id}>
                <MobileListItem
                  title={h.name}
                  subtitle={`Role · ${h.role}`}
                  meta="Open for tasks, money, receipts…"
                  href={`/dashboard/household/${h.id}`}
                  trailing={
                    <span className="text-[12px] font-semibold text-dm-electric">Open</span>
                  }
                />
              </li>
            ))}
          </ul>
        )}
      </MobileSection>

      <MobileSection
        title="Household & account"
        hideDescriptionMobile
        description="Short paths so nothing hides behind tiny links."
        className="lg:border-[var(--dm-border-strong)] lg:shadow-[var(--cozy-shadow-note)]"
      >
        <ul className="flex flex-col gap-2">
          <li>
            <MobileListItem
              title="Activity timeline"
              subtitle="See full home activity history."
              href="/dashboard/activity"
              trailing={<span className="text-dm-muted">→</span>}
            />
          </li>
          <li>
            <MobileListItem
              title="Join with code"
              subtitle="Enter an invite and land in the home."
              href="/dashboard/join"
              trailing={<span className="text-dm-muted">→</span>}
            />
          </li>
          <li>
            <MobileListItem
              title="Account & profile"
              subtitle="Display name, preferences, privacy links."
              href="/dashboard/settings"
              trailing={<span className="text-dm-muted">→</span>}
            />
          </li>
          {showAdmin ?
            <li>
              <MobileListItem
                title="Site admin"
                subtitle="Platform tools"
                href="/dashboard/admin"
                trailing={<span className="text-dm-electric">→</span>}
              />
            </li>
          : null}
        </ul>
      </MobileSection>

      <MobileSection
        title="Legal"
        hideDescriptionMobile
        description="Same policies everywhere."
        className="lg:border-[var(--dm-border-strong)] lg:shadow-[var(--cozy-shadow-note)]"
      >
        <div className="flex flex-col gap-2">
          <Link
            href="/privacy"
            className="touch-manipulation flex min-h-[48px] items-center rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/50 px-4 text-[15px] font-semibold text-dm-text hover:bg-dm-elevated/80"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="touch-manipulation flex min-h-[48px] items-center rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/50 px-4 text-[15px] font-semibold text-dm-text hover:bg-dm-elevated/80"
          >
            Terms
          </Link>
        </div>
      </MobileSection>
    </div>
  );
}
