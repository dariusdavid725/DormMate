import type { ReactNode } from "react";

import type { HouseholdSummary } from "@/lib/households/queries";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { MobileHouseholdStrip } from "@/components/dashboard/mobile-household-strip";
import { SidebarNavLink } from "@/components/dashboard/sidebar-nav-link";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";

type Props = {
  email: string;
  showAdmin?: boolean;
  households: HouseholdSummary[];
  listError?: string | null;
  children: ReactNode;
};

export function DashboardShell({
  email,
  showAdmin,
  households,
  listError,
  children,
}: Props) {
  const stripItems = households.map((h) => ({ id: h.id, name: h.name }));

  return (
    <div className="flex min-h-screen flex-col">
      <WorkspaceHeader email={email} showAdmin={showAdmin} />
      <MobileHouseholdStrip households={stripItems} />
      <div className="flex min-h-0 flex-1">
        <aside className="dm-sidebar-glass hidden w-60 shrink-0 overflow-y-auto py-6 pl-6 pr-2 lg:flex lg:flex-col">
          <nav aria-label="Workspace" className="flex flex-col gap-6">
            <div>
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-dm-muted">
                Main
              </p>
              <div className="flex flex-col gap-0.5">
                <SidebarNavLink href="/dashboard" title="Home" exact />
                <SidebarNavLink href="/dashboard/tasks" title="Tasks" exact />
                <SidebarNavLink href="/dashboard/finances" title="Expenses" exact />
                <SidebarNavLink href="/dashboard/inventory" title="Groceries" exact />
                <SidebarNavLink href="/dashboard/join" title="Join household" exact />
                <SidebarNavLink href="/dashboard/settings" title="Account" exact />
                {showAdmin ? (
                  <SidebarNavLink
                    href="/dashboard/admin"
                    title="Site admin"
                    exact
                  />
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-dm-muted">
                Households
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
                    None yet. Create from Home.
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
          <main className="relative flex-1 px-4 pb-24 pt-5 lg:px-8 lg:pb-10 lg:pt-7">
            {children}
          </main>
          <footer className="hidden border-t border-[var(--dm-border-strong)] px-4 py-3 text-center text-[11px] text-dm-muted lg:block lg:px-10">
            DormMate
          </footer>
        </div>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
