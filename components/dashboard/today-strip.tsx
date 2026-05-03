type Props = {
  choresDue: number;
  owedLabel: string;
  receiptsRecent: number;
  flatmatesOthers: number;
  /** Receipt + chore highlights currently in your House activity feed */
  feedHighlightsCount: number;
  hasHouseholds: boolean;
};

export function TodayStrip({
  choresDue,
  owedLabel,
  receiptsRecent,
  flatmatesOthers,
  feedHighlightsCount,
  hasHouseholds,
}: Props) {
  const cards = [
    {
      label: "Chores open",
      value: hasHouseholds ? String(choresDue) : "—",
      hint: !hasHouseholds
        ? "Spin up a dorm first · we’ll nag nicely"
        : choresDue === 0
          ? "All clear. Nobody’s slacking today 👀"
          : choresDue > 3
            ? "Okay okay, it’s a pile — snag one?"
            : "Small stack · grab the easy dopamine win",
      tone: choresDue > 3 ? ("alert" as const) : ("default" as const),
    },
    {
      label: "You’re owed",
      value: hasHouseholds ? owedLabel : "—",
      hint: !hasHouseholds
        ? ""
        : "Splits are cooking — stash receipts now ✨",
      tone: "money" as const,
    },
    {
      label: "Receipts (7 days)",
      value: hasHouseholds ? String(receiptsRecent) : "—",
      hint: !hasHouseholds
        ? ""
        : receiptsRecent === 0
          ? "Quiet week — unless someone’s hoarding Tesco tapes 😄"
          : "Nice — the ledger remembers so you don’t have to",
      tone: receiptsRecent >= 5 ? ("fun" as const) : ("default" as const),
    },
    {
      label: "Flatmates linked",
      value: hasHouseholds ? String(flatmatesOthers) : "—",
      hint: !hasHouseholds
        ? ""
        : flatmatesOthers === 0
          ? "Solo ranger — flick an invite later"
          : "Crew synced across your spaces",
      tone:
        flatmatesOthers === 0 && hasHouseholds
          ? ("fun" as const)
          : ("default" as const),
    },
    {
      label: "Buzz in feed",
      value: !hasHouseholds ? "—" : String(feedHighlightsCount),
      hint: !hasHouseholds
        ? ""
        : feedHighlightsCount === 0
          ? "Feed’s quiet — receipts & wins land here loudly"
          : "Fresh chaos below · receipts, wins, roommate lore",
      tone: feedHighlightsCount >= 3 ? ("electric" as const) : ("default" as const),
    },
  ] as const;

  function ringTone(
    t: (typeof cards)[number]["tone"],
  ): string {
    if (t === "alert")
      return "ring-1 ring-[color-mix(in_srgb,var(--dm-fun)_55%,transparent)] bg-[linear-gradient(160deg,color-mix(in_srgb,var(--dm-fun)_14%,var(--dm-surface)),color-mix(in_srgb,var(--dm-surface-mid)_90%,transparent))]";
    if (t === "money")
      return "ring-1 ring-[color-mix(in_srgb,var(--dm-accent)_42%,transparent)] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--dm-accent-soft)_140%,transparent),color-mix(in_srgb,var(--dm-surface-mid)_88%,transparent))]";
    if (t === "fun")
      return "ring-1 ring-[color-mix(in_srgb,var(--dm-fun)_38%,transparent)] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--dm-fun)_12%,transparent),color-mix(in_srgb,var(--dm-surface)_92%,transparent))]";
    if (t === "electric")
      return "ring-1 ring-[color-mix(in_srgb,var(--dm-electric)_45%,transparent)] bg-[linear-gradient(165deg,color-mix(in_srgb,var(--dm-electric)_16%,transparent),color-mix(in_srgb,var(--dm-surface-mid)_90%,transparent))]";
    return "ring-1 ring-[var(--dm-border)] bg-[color-mix(in_srgb,var(--dm-surface)_92%,transparent)]";
  }

  return (
    <section aria-label="Today summary" className="w-full">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-dm-muted">
          Today snapshot
        </p>
        <span className="inline-flex items-center gap-1 rounded-full border border-[color-mix(in_srgb,var(--dm-electric)_28%,transparent)] bg-[color-mix(in_srgb,var(--dm-electric)_10%,transparent)] px-3 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-dm-electric">
          <span
            aria-hidden
            className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--dm-accent)] shadow-[0_0_12px_color-mix(in_srgb,var(--dm-accent)_80%,transparent)]"
          />{" "}
          Live-ish
        </span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div
            key={c.label}
            className={[
              "dm-card-interactive rounded-xl px-3 py-3 shadow-[0_14px_40px_-26px_rgba(0,0,0,.55)] backdrop-blur-[2px]",
              ringTone(c.tone),
            ].join(" ")}
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-dm-muted">
              {c.label}
            </p>
            <p className="mt-1 font-mono text-xl font-black tabular-nums tracking-tight text-dm-text sm:text-[1.35rem]">
              {c.value}
            </p>
            {c.hint ? (
              <p className="mt-1 text-[11px] leading-snug text-dm-muted">{c.hint}</p>
            ) : null}
          </div>
        ))}
      </div>
    </section>
  );
}
