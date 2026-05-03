type Props = {
  /** e.g. 3 of 4 “home” metaphor — MVP uses households linked vs target. */
  filled: number;
  total: number;
  subtitle: string;
};

export function DormStatusRing({ filled, total, subtitle }: Props) {
  const pct =
    total > 0 ? Math.min(100, Math.max(0, (filled / total) * 100)) : 0;
  const deg = (pct / 100) * 360;

  return (
    <div className="flex items-center gap-3">
      <div
        className="relative h-14 w-14 shrink-0 rounded-full border-[3px] border-dm-electric shadow-[4px_4px_0_0_var(--dm-border-strong)]"
        aria-hidden
        style={{
          background: `conic-gradient(var(--dm-accent) ${deg}deg, transparent 0)`,
        }}
      >
        <div className="absolute inset-[3px] flex items-center justify-center rounded-full bg-dm-surface text-[11px] font-bold tabular-nums text-dm-text">
          {filled}/{total}
        </div>
      </div>
      <div className="min-w-0 leading-tight">
        <p className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-dm-muted">
          Dorm pulse
        </p>
        <p className="truncate text-[13px] font-semibold text-dm-text">
          All good · {subtitle}
        </p>
      </div>
    </div>
  );
}
