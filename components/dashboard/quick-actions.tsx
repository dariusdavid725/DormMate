import Link from "next/link";

export function DashboardQuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[1.2rem] font-semibold tracking-tight text-dm-text">
          Shortcuts
        </span>
        <span
          className="h-px max-w-[3rem] flex-1 bg-dm-border-strong"
          aria-hidden
        />
      </div>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/tasks"
          className={[
            "dm-card-surface dm-card-interactive cozy-drop-in inline-block px-5 py-3 text-sm font-semibold text-dm-text",
          ].join(" ")}
          style={{ animationDelay: "90ms" }}
        >
          + Add chore
        </Link>
        <Link
          href="/dashboard/finances"
          className={[
            "dm-card-surface dm-card-interactive cozy-drop-in relative inline-flex items-center px-5 py-3 text-sm font-medium text-dm-text",
          ].join(" ")}
          style={{ animationDelay: "140ms" }}
        >
          <span className="relative z-[1]">Money overview</span>
        </Link>
        <Link
          href="/dashboard/more"
          className="dm-card-surface dm-card-interactive cozy-drop-in inline-flex px-5 py-3 text-sm font-semibold text-dm-muted"
          style={{ animationDelay: "190ms" }}
          title="Open a home to see events"
        >
          Open a home to see events
        </Link>
        <Link
          href="/dashboard/join"
          className={[
            "cozy-drop-in inline-flex px-5 py-3 text-sm font-semibold text-dm-muted underline-offset-4",
            "hover:underline",
          ].join(" ")}
          style={{ animationDelay: "240ms" }}
        >
          Join home with code
        </Link>
      </div>
    </section>
  );
}
