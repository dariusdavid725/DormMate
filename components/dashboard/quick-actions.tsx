import Link from "next/link";

export function DashboardQuickActions() {
  return (
    <section aria-label="Quick actions">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-cozy-display text-2xl text-dm-text">
          Shortcuts
        </span>
        <span
          className="h-px max-w-[3rem] flex-1 bg-dm-border-strong"
          aria-hidden
        />
      </div>
      <p className="mb-3 text-[12px] text-dm-muted">
        Chores: daily tasks. Money: shared bills. Events live on each home page.
      </p>
      <div className="flex flex-wrap gap-3">
        <Link
          href="/dashboard/tasks"
          className={[
            "cozy-note cozy-hover-wiggle cozy-drop-in px-5 py-3 text-sm font-semibold text-dm-text shadow-none",
            "cozy-tilt-xs inline-block hover:brightness-[1.03]",
          ].join(" ")}
          style={{ animationDelay: "90ms" }}
        >
          + Add chore
        </Link>
        <Link
          href="/dashboard/finances"
          className={[
            "cozy-receipt cozy-hover-wiggle cozy-drop-in relative inline-flex items-center px-5 py-3 text-sm font-medium text-dm-text",
            "cozy-tilt-xs-alt hover:brightness-[1.02]",
          ].join(" ")}
          style={{ animationDelay: "140ms" }}
        >
          <span className="relative z-[1]">Money overview</span>
        </Link>
        <span
          className="cozy-poster cozy-drop-in cozy-tilt-xs inline-flex px-5 py-3 text-sm font-semibold text-dm-muted cozy-hover-wiggle"
          style={{ animationDelay: "190ms" }}
          title="Choose your household, then open the Events tab"
        >
          Events · open your household first
        </span>
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
