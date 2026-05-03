type Props = {
  choresDue: number;
  owedLabel: string;
  receiptsRecent: number;
  flatmatesOthers: number;
  hasHouseholds: boolean;
};

export function TodayStrip({
  choresDue,
  owedLabel,
  receiptsRecent,
  flatmatesOthers,
  hasHouseholds,
}: Props) {
  const cards = [
    {
      label: "Chores open",
      value: hasHouseholds ? String(choresDue) : "—",
      hint: !hasHouseholds
        ? "Start with a household"
        : choresDue === 0
          ? "Nobody owes chores today."
          : choresDue > 2
            ? "Quite a few — check Tasks"
            : "On your shared list",
      tone: choresDue > 2 ? ("alert" as const) : ("default" as const),
    },
    {
      label: "You’re owed",
      value: hasHouseholds ? owedLabel : "—",
      hint: !hasHouseholds ? "" : "Split math is on the roadmap",
      tone: "money" as const,
    },
    {
      label: "Receipts (last 7 days)",
      value: hasHouseholds ? String(receiptsRecent) : "—",
      hint: !hasHouseholds
        ? ""
        : receiptsRecent === 0
          ? "Quiet on scans"
          : "Saved this week",
      tone: "default" as const,
    },
    {
      label: "Flatmates linked",
      value: hasHouseholds ? String(flatmatesOthers) : "—",
      hint: !hasHouseholds
        ? ""
        : flatmatesOthers === 0
          ? "Solo for now — invite mates"
          : "Across your households",
      tone:
        flatmatesOthers === 0 && hasHouseholds
          ? ("fun" as const)
          : ("default" as const),
    },
  ];

  function ringTone(t: (typeof cards)[number]["tone"]) {
    if (t === "alert")
      return "ring-1 ring-amber-400/45 bg-[color-mix(in_srgb,var(--dm-fun)_8%,var(--dm-surface))]";
    if (t === "money")
      return "ring-1 ring-[color-mix(in_srgb,var(--dm-accent)_35%,transparent)] bg-[color-mix(in_srgb,var(--dm-accent)_6%,var(--dm-surface))]";
    if (t === "fun")
      return "ring-1 ring-[color-mix(in_srgb,var(--dm-fun)_40%,transparent)] bg-[color-mix(in_srgb,var(--dm-fun)_10%,var(--dm-surface))]";
    return "ring-1 ring-[var(--dm-border)] bg-dm-surface/82";
  }

  return (
    <section aria-label="Today at a glance" className="w-full">
      <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-dm-muted">
        Today · your flat at a glance
      </p>
      <div className="mt-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        {cards.map((c) => (
          <div
            key={c.label}
            className={[
              "rounded-xl px-4 py-3.5 backdrop-blur-sm transition-[transform,box-shadow] duration-200 ease-out motion-safe:hover:scale-[1.01]",
              ringTone(c.tone),
            ].join(" ")}
          >
            <p className="text-[11px] font-medium uppercase tracking-wide text-dm-muted">
              {c.label}
            </p>
            <p className="mt-2 font-mono text-2xl font-bold tabular-nums tracking-tight text-dm-text">
              {c.value}
            </p>
            {c.hint ? (
              <p className="mt-2 text-[11px] leading-snug text-dm-muted">
                {c.hint}
              </p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
