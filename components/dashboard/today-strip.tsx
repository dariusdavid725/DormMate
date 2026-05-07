type Props = {
  choresDue: number;
  owedLabel: string;
  receiptsRecent: number;
  hasHouseholds: boolean;
};

export function TodayStrip({
  choresDue,
  owedLabel,
  receiptsRecent,
  hasHouseholds,
}: Props) {
  const cells = [
    {
      label: "Tasks",
      value: hasHouseholds ? String(choresDue) : "—",
      tilt: "cozy-tilt-xs" as const,
    },
    {
      label: "Balance (open bills)",
      value: hasHouseholds ? owedLabel : "—",
      tilt: "cozy-tilt-xs-alt" as const,
    },
    {
      label: "Receipts · 7d",
      value: hasHouseholds ? String(receiptsRecent) : "—",
      tilt: "cozy-tilt-xs" as const,
    },
  ];

  return (
    <section aria-label="Today summary" className="w-full">
      <div className="mb-2 flex items-center gap-2">
        <span className="font-cozy-display text-2xl text-dm-text">Today</span>
        <span
          className="h-px flex-1 max-w-[4rem] bg-dm-border-strong"
          aria-hidden
        />
      </div>
      <div className="grid grid-cols-3 gap-2.5 sm:gap-3">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={[
              "cozy-note relative px-3 py-2.5 cozy-drop-in cozy-hover-wiggle pt-5",
              c.tilt,
            ].join(" ")}
            style={{ animationDelay: `${i * 70}ms` }}
          >
            <span
              className="cozy-pin absolute left-1/2 top-1.5 -translate-x-1/2 opacity-90"
              aria-hidden
            />
            <p className="text-center text-[10px] font-semibold uppercase tracking-wide text-dm-muted">
              {c.label}
            </p>
            <p className="mt-1 text-center font-mono text-lg font-bold tabular-nums text-dm-text">
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
