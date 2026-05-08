type Props = {
  choresDue: number;
  owedLabel: string;
  receiptsRecent: number;
  groceriesLabel: string;
  hasHouseholds: boolean;
};

export function TodayStrip({
  choresDue,
  owedLabel,
  receiptsRecent,
  groceriesLabel,
  hasHouseholds,
}: Props) {
  const cells = [
    {
      label: "Chores",
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
    {
      label: "Groceries",
      value: hasHouseholds ? groceriesLabel : "—",
      tilt: "cozy-tilt-xs-alt" as const,
    },
  ];

  return (
    <section aria-label="Today summary" className="w-full">
      <div className="mb-2 flex items-center gap-2">
        <span className="text-[1.25rem] font-semibold tracking-tight text-dm-text">Today</span>
        <span
          className="h-px flex-1 max-w-[4rem] bg-dm-border-strong"
          aria-hidden
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={[
              "dm-card-surface relative px-3 py-2.5 cozy-drop-in pt-5",
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
