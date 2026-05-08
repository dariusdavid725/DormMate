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
        <aside className="hidden shrink-0 lg:flex lg:w-[264px]">
          <div className="dm-shell-panel sticky top-[5.35rem] m-3 flex h-[calc(100vh-6.5rem)] w-[248px] flex-col px-3 py-3">
          <Link
            href="/dashboard"
            className="mb-4 flex items-center gap-3 rounded-xl border border-[var(--dm-border)] bg-dm-surface px-3 py-2.5"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand logo in public */}
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-cover" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-[15px] font-semibold text-dm-text">Koti</p>
              <p className="truncate text-[11px] text-dm-muted">Shared home board</p>
            </div>
          </Link>
          <nav aria-label="Workspace" className="flex flex-1 flex-col gap-5 overflow-y-auto pr-1">
            <div>
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-dm-muted">Main</p>
              <div className="flex flex-col gap-1">
                <SidebarNavLink href="/dashboard" title="Home" icon="⌂" exact />
                <SidebarNavLink href="/dashboard/tasks" title="Chores" icon="✓" exact />
                <SidebarNavLink href="/dashboard/finances" title="Money" icon="$" exact />
                <SidebarNavLink href="/dashboard/inventory" title="Groceries" icon="◧" exact />
                <SidebarNavLink href="/dashboard/activity" title="Activity" icon="◴" exact />
                <SidebarNavLink href="/dashboard/more" title="More" icon="…" exact />
                <SidebarNavLink href="/dashboard/join" title="Join home" icon="+" exact />
                <SidebarNavLink href="/dashboard/settings" title="Account" icon="⚙" exact />
                {showAdmin ? <SidebarNavLink href="/dashboard/admin" title="Site admin" icon="★" exact /> : null}
              </div>
            </div>
            <div className="min-h-0">
              <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-dm-muted">Homes</p>
              <div className="flex flex-col gap-1">
                {households.slice(0, 8).map((h) => (
                  <SidebarNavLink key={h.id} href={`/dashboard/household/${h.id}`} title={h.name} hint={h.role} icon={h.name.slice(0, 1).toUpperCase()} />
                ))}
                {households.length === 0 ? (
                  <p className="rounded-lg border border-dashed border-[var(--dm-border-strong)] px-3 py-2 text-[12px] text-dm-muted">
                    No homes yet. Create one from Home.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-auto border-t border-[var(--dm-border)] pt-3">
              <div className="flex items-center gap-2 px-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-dm-muted">
                Legal
              </div>
              <div className="mt-2 flex items-center gap-2 px-2 text-[12px]">
                <a className="text-dm-muted transition-colors hover:text-dm-electric" href="/privacy">
                  Privacy
                </a>
                <span className="text-dm-muted-soft">·</span>
                <a className="text-dm-muted transition-colors hover:text-dm-electric" href="/terms">
                  Terms
                </a>
              </div>
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
          <main className="relative flex-1 px-3 pb-[calc(7.65rem+env(safe-area-inset-bottom))] pt-3 sm:px-4 lg:px-7 lg:pb-10 lg:pt-6">
            <div className="mx-auto w-full max-w-[1260px]">
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
