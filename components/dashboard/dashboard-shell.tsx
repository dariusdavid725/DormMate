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
        <aside className="dm-sidebar-glass hidden w-64 shrink-0 overflow-y-auto py-6 pl-5 pr-3 lg:flex lg:flex-col">
          <Link
            href="/dashboard"
            className="mb-5 mr-3 flex items-center gap-3 rounded-xl border border-[var(--dm-border)] bg-dm-surface px-3 py-2.5 shadow-[0_8px_18px_rgba(45,41,37,0.08)]"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand logo in public */}
            <img src="/logo.png" alt="" className="h-9 w-9 rounded-lg object-cover" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold leading-tight text-dm-text">Koti</p>
              <p className="truncate text-[11px] leading-tight text-dm-muted">Shared home board</p>
            </div>
          </Link>
          <nav aria-label="Workspace" className="flex flex-col gap-5">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-dm-muted">
                Main
              </p>
              <div className="flex flex-col gap-0.5">
                <SidebarNavLink href="/dashboard" title="Home" icon="⌂" exact />
                <SidebarNavLink href="/dashboard/tasks" title="Chores" icon="✓" exact />
                <SidebarNavLink href="/dashboard/finances" title="Money" icon="$" exact />
                <SidebarNavLink href="/dashboard/inventory" title="Groceries" icon="◧" exact />
                <SidebarNavLink href="/dashboard/activity" title="Activity" icon="◴" exact />
                <SidebarNavLink href="/dashboard/more" title="More" icon="…" exact />
                <SidebarNavLink href="/dashboard/join" title="Join home" icon="+" exact />
                <SidebarNavLink href="/dashboard/settings" title="Account" icon="⚙" exact />
                {showAdmin ? (
                  <SidebarNavLink
                    href="/dashboard/admin"
                    title="Site admin"
                    icon="★"
                    exact
                  />
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-dm-muted">
                Homes
              </p>
              <div className="flex flex-col gap-0.5">
                {households.map((h) => (
                  <SidebarNavLink
                    key={h.id}
                    href={`/dashboard/household/${h.id}`}
                    title={h.name}
                    hint={h.role}
                  />
                ))}
                {households.length === 0 ? (
                  <p className="rounded-md border border-dashed border-[var(--dm-border-strong)] px-2.5 py-2 text-[12px] text-dm-muted">
                    No homes yet. Create one from Home.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-auto border-t border-[var(--dm-border-strong)] pt-4">
              <p className="text-[11px] font-medium uppercase tracking-wide text-dm-muted">
                Legal
              </p>
              <div className="mt-2 flex flex-col gap-1 text-sm">
                <a className="text-dm-muted hover:text-dm-electric" href="/privacy">
                  Privacy
                </a>
                <a className="text-dm-muted hover:text-dm-electric" href="/terms">
                  Terms
                </a>
              </div>
            </div>
          </nav>
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
