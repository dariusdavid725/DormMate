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
    <div className="flex min-h-screen flex-col bg-dm-bg">
      <WorkspaceHeader email={email} showAdmin={showAdmin} />
      <MobileHouseholdStrip households={stripItems} />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-[272px] shrink-0 overflow-y-auto border-r-[3px] border-dm-electric bg-dm-surface py-6 pl-8 pr-4 lg:flex lg:flex-col">
          <nav aria-label="Workspace" className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-dm-muted">
                Main
              </p>
              <div className="flex flex-col gap-0.5">
                <SidebarNavLink
                  href="/dashboard"
                  title="Pulse"
                  hint="Dorm radar"
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
              <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-dm-muted">
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
                  <p className="rounded-none border-[3px] border-dashed border-dm-muted/50 px-3 py-4 text-xs font-medium leading-relaxed text-dm-muted">
                    No households yet · anchor from Pulse column.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-auto border-t-[3px] border-dm-electric/30 pt-6 text-[10px] font-bold uppercase tracking-[0.12em] text-dm-muted">
              <p>Legal</p>
              <div className="mt-2 flex flex-col gap-1.5 font-semibold normal-case">
                <a
                  className="text-dm-electric hover:underline"
                  href="/privacy"
                >
                  Privacy
                </a>
                <a
                  className="text-dm-electric hover:underline"
                  href="/terms"
                >
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
              className="mx-4 mt-4 border-[3px] border-dm-accent-warn-text bg-dm-accent-warn-bg px-4 py-3 font-mono text-xs font-bold uppercase tracking-wide text-dm-accent-warn-text lg:mx-8"
            >
              We couldn&apos;t refresh the household sidebar. Reload the page
              after checking your Supabase schema.
            </div>
          ) : null}
          <main className="relative flex-1 px-4 pb-8 pt-6 lg:px-10 lg:py-10">
            {children}
          </main>
          <footer className="hidden border-t-[3px] border-dm-electric/30 px-4 py-6 text-center text-[10px] font-black uppercase tracking-widest text-dm-muted lg:block lg:px-10">
            DormMate · dorm finance OS
          </footer>
        </div>
      </div>
      <DashboardBottomNav />
    </div>
  );
}
