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
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className="rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/40 px-3 py-2.5 dm-card-enter"
            style={{ animationDelay: `${i * 40}ms` }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-dm-muted">
              {c.label}
            </p>
            <p className="mt-1 font-mono text-lg font-bold tabular-nums text-dm-text">
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
