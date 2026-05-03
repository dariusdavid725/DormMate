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
      className="dm-panel-ribbon dm-fade-in-up rounded-[1.1rem] px-3 py-3 sm:px-4 sm:py-3.5"
    >
      <p className="mb-2.5 text-[10px] font-black uppercase tracking-[0.28em] text-dm-muted">
        Quick moves
      </p>
      <div className="flex flex-wrap gap-2">
        {scanHref ? (
          <Link
            href={scanHref}
            className="dm-scan-hero dm-hover-tap inline-flex shrink-0 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-black tracking-tight text-[#071018] shadow-[0_16px_40px_-16px_var(--dm-electric-glow)] transition-[filter,transform] duration-200 hover:brightness-110"
          >
            Scan receipt
          </Link>
        ) : null}
        <Link href="/dashboard/tasks" className="dm-btn-secondary dm-hover-tap !text-sm">
          Tasks
        </Link>
        <Link
          href="/dashboard/finances"
          className="dm-hover-tap inline-flex shrink-0 items-center justify-center rounded-xl border border-[color-mix(in_srgb,var(--dm-accent)_32%,transparent)] bg-[color-mix(in_srgb,var(--dm-accent)_9%,transparent)] px-4 py-2.5 text-sm font-bold text-dm-accent shadow-[inset_0_1px_0_rgba(255,255,255,.06)] transition duration-200 hover:brightness-110 hover:shadow-[0_0_26px_-8px_color-mix(in_srgb,var(--dm-accent)_50%,transparent)]"
        >
          Money
        </Link>
        {hasHouseholds ? (
          <Link href="/dashboard/inventory" className="dm-btn-secondary dm-hover-tap !text-sm">
            Groceries
          </Link>
        ) : null}
      </div>
    </div>
  );
}
