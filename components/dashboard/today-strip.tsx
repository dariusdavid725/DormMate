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
    },
    {
      label: "You’re owed",
      value: hasHouseholds ? owedLabel : "—",
    },
    {
      label: "Receipts · 7d",
      value: hasHouseholds ? String(receiptsRecent) : "—",
    },
  ];

  return (
    <section aria-label="Today summary" className="w-full">
      <h2 className="text-[13px] font-semibold tracking-tight text-dm-muted">
        Today
      </h2>
      <div className="mt-3 grid grid-cols-3 gap-2">
        {cells.map((c) => (
          <div
            key={c.label}
            className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface px-3 py-2.5"
          >
            <p className="text-[11px] text-dm-muted">{c.label}</p>
            <p className="mt-0.5 font-mono text-lg font-semibold tabular-nums text-dm-text">
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
