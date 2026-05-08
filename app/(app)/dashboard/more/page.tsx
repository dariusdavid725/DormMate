import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { PwaInstallMoreCard } from "@/components/pwa/pwa-install-cta";
import { MobileScrollViewport } from "@/components/mobile/mobile-scroll-viewport";
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
  const firstHousehold = households[0] ?? null;

  return (
    <div className="mx-auto flex min-h-0 w-full max-w-lg flex-1 flex-col overflow-hidden lg:block lg:flex-none lg:max-w-2xl lg:overflow-visible lg:space-y-5 lg:pb-10">
      <MobileScrollViewport className="flex flex-col gap-5 px-px pb-3 pt-1 lg:flex-none lg:contents lg:p-0">
      <header className="border-b border-dashed border-[var(--dm-border-strong)] pb-4 lg:pb-6">
        <h1 className="font-cozy-display text-[1.65rem] leading-tight text-dm-text max-lg:font-bold lg:text-[2.35rem]">
          More
        </h1>
        <p className="mt-1.5 text-[13px] leading-snug text-dm-muted lg:hidden">
          The rest of your home—in one menu.
        </p>
        <p className="mt-2 hidden text-[13px] leading-snug text-dm-muted lg:block">
          Homes, invites, and account — everything beyond the daily tabs.
        </p>
      </header>

      <PwaInstallMoreCard />

      {error ?
        <p className="rounded-xl border border-dm-danger/35 px-4 py-3 text-[13px] text-dm-danger">
          Could not load homes.
        </p>
      : null}

      {firstHousehold ?
        <MobileSection
          title="Around your home"
          hideDescriptionMobile
          description="Shortcuts into your first household. Switch homes anytime from Home or the picker above."
          className="lg:border-[var(--dm-border-strong)] lg:shadow-[var(--cozy-shadow-note)]"
        >
          <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            <li className="min-w-0 sm:col-span-1">
              <MobileListItem
                title="Roommates"
                subtitle={`${firstHousehold.name} · People & invites`}
                href={`/dashboard/household/${firstHousehold.id}?view=members`}
                trailing={<span className="text-[12px] font-semibold text-dm-electric">Open</span>}
              />
            </li>
            <li className="min-w-0 sm:col-span-1">
              <MobileListItem
                title="Receipts"
                subtitle="Saved uploads & totals"
                href={`/dashboard/household/${firstHousehold.id}?view=receipts`}
                trailing={<span className="text-[12px] font-semibold text-dm-electric">Open</span>}
              />
            </li>
            <li className="min-w-0 sm:col-span-1">
              <MobileListItem
                title="Events"
                subtitle="What’s happening together"
                href={`/dashboard/household/${firstHousehold.id}?view=events`}
                trailing={<span className="text-[12px] font-semibold text-dm-electric">Open</span>}
              />
            </li>
          </ul>
          {households.length > 1 ?
            <p className="mt-3 text-[12px] leading-snug text-dm-muted">
              You have {households.length} homes—these shortcuts use <span className="font-semibold text-dm-text">{firstHousehold.name}</span>.
              Pick another from{" "}
              <Link href="/dashboard" className="font-semibold text-dm-electric hover:underline">
                Home
              </Link>{" "}
              or{" "}
              <span className="font-semibold text-dm-text">Your homes</span> below.
            </p>
          : null}
        </MobileSection>
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
              title="Profile & settings"
              subtitle="Display name, privacy, notifications."
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
      </MobileScrollViewport>
    </div>
  );
}
