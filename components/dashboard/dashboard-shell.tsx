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
  children: React.ReactNode;
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
      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-[272px] shrink-0 overflow-y-auto border-r border-[var(--dm-border-strong)] bg-dm-surface/65 py-8 pl-8 pr-4 backdrop-blur-sm lg:flex lg:flex-col">
          <nav aria-label="Workspace" className="flex flex-col gap-8">
            <div>
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-dm-muted/90">
                Main
              </p>
              <div className="flex flex-col gap-1">
                <SidebarNavLink
                  href="/dashboard"
                  title="Home"
                  hint="Overview & activity"
                  exact
                />
                <SidebarNavLink
                  href="/dashboard/tasks"
                  title="Tasks"
                  hint="Chores & rewards"
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
              <p className="mb-3 text-[11px] font-semibold uppercase tracking-wider text-dm-muted/90">
                Households
              </p>
              <div className="flex flex-col gap-1">
                {households.map((h) => (
                  <SidebarNavLink
                    key={h.id}
                    href={`/dashboard/household/${h.id}`}
                    title={h.name}
                    hint={h.role}
                  />
                ))}
                {households.length === 0 ? (
                  <p className="rounded-xl border border-dashed border-[var(--dm-border-strong)] px-3 py-4 text-xs leading-relaxed text-dm-muted">
                    No households yet — create one from Home (right column on desktop).
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-auto border-t border-[var(--dm-border)] pt-6">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-dm-muted/80">
                Legal
              </p>
              <div className="mt-3 flex flex-col gap-2 text-sm font-medium normal-case">
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
              className="mx-4 mt-4 rounded-xl border border-amber-300/55 bg-[var(--dm-accent-warn-bg)] px-4 py-3 text-sm text-[var(--dm-accent-warn-text)] lg:mx-8"
            >
              Couldn&apos;t refresh the sidebar list. Reload after checking schema.
            </div>
          ) : null}
          <main className="relative flex-1 px-4 pb-8 pt-6 lg:px-10 lg:py-10">
            {children}
          </main>
          <footer className="hidden border-t border-[var(--dm-border)] px-4 py-6 text-center text-xs text-dm-muted lg:block lg:px-10">
            DormMate
          </footer>
        </div>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
