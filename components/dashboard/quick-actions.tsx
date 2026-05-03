import Link from "next/link";

export function DashboardQuickActions({
  scanHref,
  hasHouseholds,
}: {
  scanHref: string | null;
  hasHouseholds: boolean;
}) {
  return (
    <div
      aria-label="Quick actions"
      className="rounded-2xl border border-[var(--dm-border-strong)] bg-[color-mix(in_srgb,var(--dm-electric)_4%,transparent)] p-3 sm:p-3.5"
    >
      <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-dm-muted">
        Quick actions
      </p>
      <div className="flex flex-wrap gap-2">
        {scanHref ? (
          <Link
            href={scanHref}
            className="dm-hover-tap dm-scan-hero inline-flex shrink-0 items-center justify-center rounded-xl bg-dm-electric px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-[filter] duration-200 hover:brightness-110"
          >
            Scan receipt
          </Link>
        ) : null}
        <Link
          href="/dashboard/tasks"
          className="dm-hover-tap inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/80 px-4 py-2.5 text-sm font-semibold text-dm-text transition-colors duration-200 hover:border-dm-electric/45 hover:text-dm-electric"
        >
          Tasks
        </Link>
        <Link
          href="/dashboard/finances"
          className="dm-hover-tap inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/80 px-4 py-2.5 text-sm font-semibold text-dm-text transition-colors duration-200 hover:border-dm-accent/50 hover:text-dm-accent"
        >
          Money
        </Link>
        {hasHouseholds ? (
          <Link
            href="/dashboard/inventory"
            className="dm-hover-tap inline-flex shrink-0 items-center justify-center rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/80 px-4 py-2.5 text-sm font-semibold text-dm-text transition-colors duration-200 hover:border-dm-electric/40"
          >
            Groceries
          </Link>
        ) : null}
      </div>
    </div>
  );
}
