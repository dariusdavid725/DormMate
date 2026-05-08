import type { ReactNode } from "react";
import Link from "next/link";

import type { HouseholdSummary } from "@/lib/households/queries";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { MobileAppShell } from "@/components/mobile/mobile-app-shell";
import { MobileTopBar } from "@/components/mobile/mobile-top-bar";
import { SidebarNavLink } from "@/components/dashboard/sidebar-nav-link";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";

type Props = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  showAdmin?: boolean;
  households: HouseholdSummary[];
  listError?: string | null;
  children: ReactNode;
};

export function DashboardShell({
  email,
  displayName,
  avatarUrl,
  showAdmin,
  households,
  listError,
  children,
}: Props) {
  const stripItems = households.map((h) => ({ id: h.id, name: h.name }));

  return (
    <div className="flex min-h-screen flex-col">
      <div className="hidden lg:block">
        <WorkspaceHeader
          email={email}
          displayName={displayName}
          avatarUrl={avatarUrl}
          showAdmin={showAdmin}
          households={households.map((h) => ({ id: h.id, name: h.name, role: h.role }))}
        />
      </div>
      <MobileTopBar
        email={email}
        displayName={displayName}
        avatarUrl={avatarUrl}
        showAdmin={showAdmin}
        households={stripItems}
      />
      <div className="flex min-h-0 flex-1">
        <aside className="hidden shrink-0 lg:flex lg:w-[92px]">
          <div className="dm-nav-rail sticky top-[5.2rem] m-3 flex h-[calc(100vh-6.2rem)] w-[76px] flex-col items-center rounded-[26px] px-2 py-3">
          <Link
            href="/dashboard"
            className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--dm-border)] bg-dm-surface shadow-[0_8px_18px_rgba(45,41,37,0.08)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand logo in public */}
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-cover" aria-hidden />
          </Link>
          <nav aria-label="Workspace" className="flex flex-1 flex-col items-center gap-1.5">
            <SidebarNavLink href="/dashboard" title="Home" icon="⌂" exact compact />
            <SidebarNavLink href="/dashboard/tasks" title="Chores" icon="✓" exact compact />
            <SidebarNavLink href="/dashboard/finances" title="Money" icon="$" exact compact />
            <SidebarNavLink href="/dashboard/inventory" title="Groceries" icon="◧" exact compact />
            <SidebarNavLink href="/dashboard/activity" title="Activity" icon="◴" exact compact />
            <SidebarNavLink href="/dashboard/more" title="More" icon="…" exact compact />
            <SidebarNavLink href="/dashboard/join" title="Join home" icon="+" exact compact />
            <SidebarNavLink href="/dashboard/settings" title="Account" icon="⚙" exact compact />
            {showAdmin ? <SidebarNavLink href="/dashboard/admin" title="Site admin" icon="★" exact compact /> : null}
            <div className="mt-auto flex flex-col gap-1.5 pt-3">
              <a className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-dm-muted hover:border-[var(--dm-border-strong)] hover:bg-dm-surface hover:text-dm-electric" href="/privacy" title="Privacy">
                P
              </a>
              <a className="inline-flex h-9 w-9 items-center justify-center rounded-xl border border-transparent text-dm-muted hover:border-[var(--dm-border-strong)] hover:bg-dm-surface hover:text-dm-electric" href="/terms" title="Terms">
                T
              </a>
            </div>
          </nav>
          </div>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col">
          {listError ? (
            <div
              role="status"
              className="mx-4 mt-3 rounded-md border border-[var(--dm-border-strong)] px-4 py-2.5 text-sm text-dm-muted lg:mx-8"
            >
              Sidebar list unavailable. Reload if this persists.
            </div>
          ) : null}
          <main className="relative flex-1 px-3 pb-[calc(7.65rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 lg:px-6 lg:pb-10 lg:pt-6">
            <div className="mx-auto w-full max-w-[1240px]">
              <MobileAppShell>{children}</MobileAppShell>
            </div>
          </main>
          <footer className="hidden border-t border-[var(--dm-border-strong)] px-4 py-3 text-center text-[11px] text-dm-muted lg:block lg:px-10">
            Koti
          </footer>
        </div>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
