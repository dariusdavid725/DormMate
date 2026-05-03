type Props = {
  filled: number;
  total: number;
  subtitle: string;
};

export function DormStatusRing({ filled, total, subtitle }: Props) {
  const pct =
    total > 0 ? Math.min(100, Math.max(0, (filled / total) * 100)) : 0;

  return (
    <div className="dm-card-surface dm-card-interactive flex items-center gap-3 rounded-[1rem] px-3.5 py-2.5">
      <div
        className="relative h-[3rem] w-[3rem] shrink-0 rounded-full shadow-[inset_0_3px_10px_rgba(0,0,0,.45)] ring-2 ring-black/35"
        style={{
          background: `conic-gradient(var(--dm-electric) ${pct * 3.6}deg, rgba(148,178,226,0.18) 0)`,
        }}
        aria-hidden
      >
        <div className="absolute inset-[4px] flex items-center justify-center rounded-full bg-[var(--dm-surface-mid)] text-[11px] font-black tabular-nums text-dm-text ring-1 ring-[var(--dm-border-strong)]">
          {filled}/{total}
        </div>
      </div>
      <div className="min-w-0 leading-tight">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-dm-muted">
          Flat signal
        </p>
        <p className="truncate text-[13px] font-bold text-dm-text">{subtitle}</p>
      </div>
    </div>
  );
}
