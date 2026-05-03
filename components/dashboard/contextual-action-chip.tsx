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
        className="inline-flex items-center gap-2 rounded-full border border-[var(--dm-accent-warn-text)]/25 bg-[var(--dm-accent-warn-bg)] px-4 py-2 text-[13px] font-medium text-[var(--dm-accent-warn-text)] shadow-sm shadow-black/[0.04] transition hover:brightness-[1.03]"
      >
        <span aria-hidden className="text-base leading-none opacity-85">
          ＋
        </span>
        Add your first dorm
      </a>
    );
  }

  if (receiptsCountAllTime === 0 && scanReceiptHref) {
    return (
      <a
        href={scanReceiptHref}
        className="inline-flex items-center gap-2 rounded-full border border-[var(--dm-accent-warn-text)]/25 bg-[var(--dm-accent-warn-bg)] px-4 py-2 text-[13px] font-medium text-[var(--dm-accent-warn-text)] shadow-sm shadow-black/[0.04] transition hover:brightness-[1.03]"
      >
        <span aria-hidden>📸</span>
        Capture your first receipt
      </a>
    );
  }

  if (!primaryHouseholdHasReceipts && scanReceiptHref) {
    return (
      <a
        href={scanReceiptHref}
        className="inline-flex items-center gap-2 rounded-full border border-amber-200/55 bg-dm-surface px-4 py-2 text-[13px] font-medium text-dm-muted shadow-sm transition hover:border-amber-300/70"
      >
        <span aria-hidden>☕</span>
        Coffee run worth logging?
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[var(--dm-border)] bg-dm-elevated/60 px-4 py-2 text-[13px] font-medium text-dm-muted">
      <span aria-hidden className="text-dm-electric">⚡</span>
      Receipt pipeline active — settles next phase
    </span>
  );
}
