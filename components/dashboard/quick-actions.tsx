import Link from "next/link";

export function DashboardQuickActions() {
  return (
    <section aria-label="Quick actions">
      <h2 className="text-[13px] font-semibold tracking-tight text-dm-muted">
        Quick actions
      </h2>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link
          href="/dashboard/tasks"
          className="rounded-lg bg-dm-electric px-4 py-2 text-sm font-medium text-[#081018]"
        >
          Add task
        </Link>
        <Link
          href="/dashboard/finances"
          className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface px-4 py-2 text-sm font-medium text-dm-text hover:border-dm-electric/50"
        >
          Add expense
        </Link>
        <span
          className="cursor-not-allowed rounded-lg border border-dashed border-[var(--dm-border-strong)] px-4 py-2 text-sm font-medium text-dm-muted opacity-65"
          title="Coming later"
          aria-disabled
        >
          Create event · soon
        </span>
      </div>
    </section>
  );
}
