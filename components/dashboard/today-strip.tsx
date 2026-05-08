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
    { label: "Chores", value: hasHouseholds ? String(choresDue) : "—" },
    { label: "Balance (open bills)", value: hasHouseholds ? owedLabel : "—" },
    { label: "Receipts · 7d", value: hasHouseholds ? String(receiptsRecent) : "—" },
    { label: "Groceries", value: hasHouseholds ? groceriesLabel : "—" },
  ];

  return (
    <section aria-label="Today summary" className="w-full">
      <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4 sm:gap-3">
        {cells.map((c, i) => (
          <div
            key={c.label}
            className={[
              "dm-hover-lift min-w-0 rounded-xl border border-[var(--dm-border)] bg-dm-surface-mid/40 px-3 py-2.5 dm-card-enter",
              c.label.includes("Balance") ? "border-[color-mix(in_srgb,var(--dm-info)_30%,var(--dm-border))] bg-[color-mix(in_srgb,var(--dm-info)_5%,var(--dm-surface-mid))]" : "",
            ].join(" ")}
            style={{ animationDelay: `${i * 45}ms` }}
          >
            <p className="text-[10px] font-semibold uppercase tracking-wide text-dm-muted">
              {c.label}
            </p>
            <p
              className={[
                "mt-1 min-w-0 font-semibold leading-snug text-dm-text",
                c.label.includes("Balance") || c.label.includes("Groceries")
                  ? "break-words text-[0.8125rem] sm:text-sm"
                  : "font-mono text-base tabular-nums sm:text-lg",
              ].join(" ")}
            >
              {c.value}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
