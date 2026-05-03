type Props = {
  filled: number;
  total: number;
  subtitle: string;
};

export function DormStatusRing({ filled, total, subtitle }: Props) {
  const pct =
    total > 0 ? Math.min(100, Math.max(0, (filled / total) * 100)) : 0;

  return (
    <div className="flex items-center gap-3 rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/70 px-3 py-2.5 backdrop-blur-sm">
      <div
        className="relative h-12 w-12 shrink-0 rounded-full shadow-inner shadow-black/5"
        style={{
          background: `conic-gradient(var(--dm-accent) ${pct * 3.6}deg, rgba(148,163,184,0.25) 0)`,
        }}
        aria-hidden
      >
        <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-dm-surface text-[11px] font-semibold tabular-nums text-dm-text">
          {filled}/{total}
        </div>
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
          Dorm status
        </p>
        <p className="truncate text-[13px] font-medium text-dm-text">
          Stable · {subtitle}
        </p>
      </div>
    </div>
  );
}
