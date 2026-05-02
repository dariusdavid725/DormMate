import type { HouseholdSummary } from "@/lib/households/queries";

import { MobileHouseholdStrip } from "@/components/dashboard/mobile-household-strip";
import { SidebarNavLink } from "@/components/dashboard/sidebar-nav-link";
import { WorkspaceHeader } from "@/components/dashboard/workspace-header";

type Props = {
  email: string;
  households: HouseholdSummary[];
  listError?: string | null;
  children: React.ReactNode;
};

export function DashboardShell({
  email,
  households,
  listError,
  children,
}: Props) {
  const stripItems = households.map((h) => ({ id: h.id, name: h.name }));

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-b from-zinc-100/90 via-zinc-50 to-white dark:from-black dark:via-zinc-950 dark:to-black">
      <WorkspaceHeader email={email} />
      <MobileHouseholdStrip households={stripItems} />
      <div className="flex flex-1 min-h-0">
        <aside className="hidden w-[272px] shrink-0 overflow-y-auto border-r border-zinc-200 bg-white/60 py-6 pl-8 pr-4 backdrop-blur dark:border-zinc-800 dark:bg-zinc-950/50 lg:flex lg:flex-col">
          <nav aria-label="Workspace" className="flex flex-col gap-6">
            <div>
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
                Main
              </p>
              <div className="flex flex-col gap-0.5">
                <SidebarNavLink
                  href="/dashboard"
                  title="Overview"
                  hint="Your households"
                  exact
                />
              </div>
            </div>
            <div className="min-h-0 flex-1">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-zinc-400 dark:text-zinc-500">
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
                  <p className="rounded-xl border border-dashed border-zinc-200 px-3 py-4 text-xs leading-relaxed text-zinc-500 dark:border-zinc-800 dark:text-zinc-400">
                    No households yet — create one from the overview.
                  </p>
                ) : null}
              </div>
            </div>
            <div className="mt-auto border-t border-zinc-200 pt-6 text-[11px] text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
              <p className="font-medium uppercase tracking-[0.12em] text-zinc-400 dark:text-zinc-500">
                Legal
              </p>
              <div className="mt-2 flex flex-col gap-1.5">
                <a
                  className="text-zinc-600 hover:text-emerald-700 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
                  href="/privacy"
                >
                  Privacy
                </a>
                <a
                  className="text-zinc-600 hover:text-emerald-700 hover:underline dark:text-zinc-400 dark:hover:text-emerald-400"
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
              className="mx-4 mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 lg:mx-8 dark:border-amber-900/70 dark:bg-amber-950/40 dark:text-amber-100"
            >
              We couldn&apos;t refresh the household sidebar. Reload the page
              after checking your Supabase schema.
            </div>
          ) : null}
          <main className="relative flex-1 px-4 py-8 lg:px-10 lg:py-10">
            {children}
          </main>
          <footer className="border-t border-zinc-200/90 px-4 py-6 text-center text-[11px] text-zinc-500 lg:px-10 dark:border-zinc-800 dark:text-zinc-500">
            DormMate workspace — shared living without spreadsheet chaos.
          </footer>
        </div>
      </div>
    </div>
  );
}
