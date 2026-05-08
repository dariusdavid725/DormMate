import Link from "next/link";

export function DashboardQuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/tasks"
          className="dm-hover-lift dm-card-enter inline-flex items-center rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/35 px-4 py-2.5 text-sm font-semibold text-dm-text"
          style={{ animationDelay: "70ms" }}
        >
          + Add chore
        </Link>
        <Link
          href="/dashboard/finances"
          className="dm-hover-lift dm-card-enter inline-flex items-center rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/35 px-4 py-2.5 text-sm font-medium text-dm-text"
          style={{ animationDelay: "100ms" }}
        >
          Money overview
        </Link>
        <Link
          href="/dashboard/more"
          className="dm-hover-lift dm-card-enter inline-flex rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/35 px-4 py-2.5 text-sm font-semibold text-dm-muted"
          style={{ animationDelay: "130ms" }}
          title="Open a home to see events"
        >
          Open a home to see events
        </Link>
        <Link
          href="/dashboard/join"
          className="dm-card-enter inline-flex rounded-xl border border-dashed border-[var(--dm-border-strong)] px-4 py-2.5 text-sm font-semibold text-dm-muted underline-offset-4 hover:border-dm-electric hover:text-dm-text hover:underline"
          style={{ animationDelay: "160ms" }}
        >
          Join home with code
        </Link>
      </div>
    </section>
  );
}
