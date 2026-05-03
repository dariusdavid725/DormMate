"use client";

type Props = {
  householdsCount: number;
  receiptsCountAllTime: number;
  primaryHouseholdHasReceipts: boolean;
  scanReceiptHref: string | null;
  createHouseholdHint: boolean;
};

export function ContextualActionChip({
  householdsCount,
  receiptsCountAllTime,
  primaryHouseholdHasReceipts,
  scanReceiptHref,
  createHouseholdHint,
}: Props) {
  if (createHouseholdHint || householdsCount === 0) {
    return (
      <a
        href="#create-household"
        className="dm-hover-tap dm-fade-in-up inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--dm-fun)_45%,transparent)] bg-[linear-gradient(95deg,var(--dm-accent-warn-bg),transparent)] px-4 py-2 text-[13px] font-bold text-[var(--dm-accent-warn-text)] shadow-[0_12px_40px_-24px_color-mix(in_srgb,var(--dm-fun)_45%,transparent)] transition hover:brightness-105"
      >
        <span aria-hidden className="text-base leading-none">
          ✨
        </span>
        Plant your first dorm seed
      </a>
    );
  }

  if (receiptsCountAllTime === 0 && scanReceiptHref) {
    return (
      <a
        href={scanReceiptHref}
        className="dm-hover-tap dm-fade-in-up inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--dm-electric)_35%,transparent)] bg-[color-mix(in_srgb,var(--dm-electric)_14%,transparent)] px-4 py-2 text-[13px] font-bold text-dm-electric shadow-[0_0_40px_-16px_var(--dm-electric-glow)] transition hover:brightness-110"
      >
        <span aria-hidden>📸</span>
        First slip = instant legend · scan it live
      </a>
    );
  }

  if (!primaryHouseholdHasReceipts && scanReceiptHref) {
    return (
      <a
        href={scanReceiptHref}
        className="dm-hover-tap inline-flex items-center gap-2 rounded-full border border-[color-mix(in_srgb,var(--dm-fun)_38%,transparent)] bg-[color-mix(in_srgb,var(--dm-fun)_11%,transparent)] px-4 py-2 text-[13px] font-bold text-[var(--dm-accent-warn-text)] transition hover:brightness-105"
      >
        <span aria-hidden>☕</span>
        Coffee run worth bragging with a receipt?
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--dm-border-strong)] bg-[color-mix(in_srgb,var(--dm-surface-mid)_86%,transparent)] px-4 py-2 text-[13px] font-semibold text-dm-muted ring-1 ring-[color-mix(in_srgb,var(--dm-electric)_12%,transparent)]">
      <span aria-hidden className="text-dm-electric">⚡</span>
      Receipt pipeline humming — split math next act
    </span>
  );
}
