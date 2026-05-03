import type { ReactNode } from "react";

import type { HouseholdSummary } from "@/lib/households/queries";

import { DashboardBottomNav } from "@/components/dashboard/dashboard-bottom-nav";
import { MobileHouseholdStrip } from "@/components/dashboard/mobile-household-strip";
import { SidebarNavLink } from "@/components/dashboard/sidebar-nav-link";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";

type Props = {
  email: string;
  /** Platform super-admin — sees Admin in sidebar + header. */
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
        <aside className="dm-sidebar-glass hidden w-[262px] shrink-0 overflow-y-auto py-7 pl-8 pr-3 backdrop-blur-md lg:flex lg:flex-col">
          <nav aria-label="Workspace" className="flex flex-col gap-7">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-dm-muted">
                Main hustle
              </p>
              <div className="flex flex-col gap-1.5">
                <SidebarNavLink
                  href="/dashboard"
                  title="Home"
                  hint="Pulse & shenanigans"
                  exact
                />
                <SidebarNavLink
                  href="/dashboard/tasks"
                  title="Tasks"
                  hint="Chores + tiny bribes"
                  exact
                />
                {showAdmin ? (
                  <SidebarNavLink
                    href="/dashboard/admin"
                    title="Admin"
                    hint="Platform"
                    exact
                  />
                ) : null}
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.28em] text-dm-muted">
                Households
              </p>
              <div className="flex flex-col gap-1.5">
                {households.map((h) => (
                  <SidebarNavLink
                    key={h.id}
                    href={`/dashboard/household/${h.id}`}
                    title={h.name}
                    hint={h.role}
                  />
                ))}
                {households.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[color-mix(in_srgb,var(--dm-electric)_22%,transparent)] bg-[color-mix(in_srgb,var(--dm-surface)_90%,transparent)] px-3 py-3.5 text-xs leading-relaxed text-dm-muted">
                    No digs yet · spin one up from Home and this column lights up.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-auto border-t border-[var(--dm-border)] pt-5">
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-dm-muted/90">
                Boring-but-needed
              </p>
              <div className="mt-3 flex flex-col gap-2 text-sm font-semibold normal-case">
                <a className="text-dm-muted transition hover:text-dm-electric" href="/privacy">
                  Privacy
                </a>
                <a className="text-dm-muted transition hover:text-dm-electric" href="/terms">
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
              className="mx-4 mt-3 rounded-xl border border-[color-mix(in_srgb,var(--dm-fun)_45%,transparent)] bg-[var(--dm-accent-warn-bg)] px-4 py-3 text-sm text-[var(--dm-accent-warn-text)] lg:mx-8"
            >
              Couldn&apos;t refresh the sidebar list. Reload after checking schema.
            </div>
          ) : null}
          <main className="relative flex-1 px-4 pb-7 pt-5 lg:px-9 lg:pb-10 lg:pt-8">
            {children}
          </main>
          <footer className="hidden border-t border-[var(--dm-border-strong)] px-4 py-4 text-center text-[11px] font-medium text-dm-muted lg:block lg:px-10">
            DormMate · shared flats, fair play
          </footer>
        </div>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
