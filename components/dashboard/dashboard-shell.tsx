import type { ReactNode } from "react";

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
    <div className="flex min-h-screen flex-col lg:min-h-screen">
      <div className="hidden lg:block">
        <WorkspaceHeader
          email={email}
          displayName={displayName}
          avatarUrl={avatarUrl}
          showAdmin={showAdmin}
          households={households.map((h) => ({ id: h.id, name: h.name, role: h.role }))}
        />
      </div>
      <div
        className={[
          "flex min-h-0 flex-1 flex-col overflow-hidden",
          "max-lg:fixed max-lg:inset-0 max-lg:z-20 max-lg:h-[100dvh] max-lg:max-h-[100dvh] max-lg:bg-dm-bg",
          "lg:relative lg:inset-auto lg:z-auto lg:h-auto lg:max-h-none lg:overflow-visible",
        ].join(" ")}
      >
        <MobileTopBar
          email={email}
          displayName={displayName}
          avatarUrl={avatarUrl}
          showAdmin={showAdmin}
          households={stripItems}
        />
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden lg:flex-row lg:overflow-visible">
        <aside className="hidden shrink-0 lg:flex lg:w-[252px]" aria-label="Workspace navigation">
          <div className="dm-shell-panel dm-shell-panel-rail sticky top-[calc(env(safe-area-inset-top)+3.5rem+0.75rem)] m-3 flex max-h-[calc(100vh-env(safe-area-inset-top)-3.5rem-1.5rem)] w-[236px] flex-col gap-2 overflow-hidden py-3 pl-3 pr-2">
            <nav aria-label="Workspace" className="dm-nav-scroll min-h-0 flex-1 space-y-5 overflow-y-auto overscroll-y-contain pr-1">
              <div>
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-dm-muted">Main</p>
                <div className="flex flex-col gap-0.5">
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
                <p className="mb-1.5 px-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-dm-muted">Your homes</p>
                <div className="flex flex-col gap-0.5">
                  {households.slice(0, 10).map((h) => (
                    <SidebarNavLink
                      key={h.id}
                      href={`/dashboard/household/${h.id}`}
                      title={h.name}
                      hint={h.role}
                      icon={h.name.slice(0, 1).toUpperCase()}
                    />
                  ))}
                  {households.length === 0 ? (
                    <p className="rounded-lg border border-dashed border-[var(--dm-border-strong)] px-2.5 py-2 text-[12px] leading-snug text-dm-muted">
                      No homes yet. Create one from Home.
                    </p>
                  ) : null}
                </div>
              </div>
            </nav>
            <footer className="mt-auto shrink-0 border-t border-[var(--dm-border)] bg-[color-mix(in_srgb,var(--dm-surface)_92%,transparent)] px-2 py-2.5">
              <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.12em] text-dm-muted">Legal</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 px-2 text-[12px]">
                <a className="dm-interactive rounded text-dm-muted hover:text-dm-electric" href="/privacy">
                  Privacy
                </a>
                <span className="text-dm-muted-soft">·</span>
                <a className="dm-interactive rounded text-dm-muted hover:text-dm-electric" href="/terms">
                  Terms
                </a>
              </div>
            </footer>
          </div>
        </aside>
        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden lg:overflow-visible">
          {listError ? (
            <div
              role="status"
              className="mx-4 mt-3 shrink-0 rounded-md border border-[var(--dm-border-strong)] px-4 py-2.5 text-sm text-dm-muted lg:mx-7"
            >
              Sidebar list unavailable. Reload if this persists.
            </div>
          ) : null}
          <main className="relative flex min-h-0 flex-1 flex-col overflow-hidden px-3 pb-0 pt-1.5 sm:px-4 lg:block lg:flex-none lg:flex-1 lg:overflow-visible lg:px-7 lg:pb-10 lg:pt-5">
            <div className="mx-auto flex h-full min-h-0 w-full max-w-[1260px] flex-1 flex-col overflow-hidden lg:block lg:h-auto lg:min-h-0 lg:flex-none lg:overflow-visible">
              <MobileAppShell>{children}</MobileAppShell>
            </div>
          </main>
          <footer className="hidden border-t border-[var(--dm-border-strong)] px-4 py-2.5 text-center text-[11px] text-dm-muted lg:block lg:px-10">
            Koti
          </footer>
        </div>
        </div>
        <DashboardBottomNav />
      </div>
    </div>
  );
}
