"use client";

type Props = {
  householdsCount: number;
  receiptsCountAllTime: number;
  primaryHouseholdHasReceipts: boolean;
  scanReceiptHref: string | null;
  createHouseholdHint: boolean;
};

/**
 * Lightweight “smart” cue — evolves with product data until a real ML signal exists.
 */
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
        className="inline-flex items-center gap-2 border-[3px] border-dm-border-strong bg-dm-accent-warn-bg px-3 py-2 text-xs font-black uppercase tracking-wide text-dm-accent-warn-text shadow-[4px_4px_0_0_var(--dm-electric)] transition hover:-translate-y-px"
      >
        <span aria-hidden>＋</span>
        Anchor your dorm
      </a>
    );
  }

  if (receiptsCountAllTime === 0 && scanReceiptHref) {
    return (
      <a
        href={scanReceiptHref}
        className="inline-flex items-center gap-2 border-[3px] border-dm-border-strong bg-dm-accent-warn-bg px-3 py-2 text-xs font-black uppercase tracking-wide text-dm-accent-warn-text shadow-[4px_4px_0_0_var(--dm-electric)] transition hover:-translate-y-px"
      >
        <span aria-hidden>📸</span>
        First receipt? Scan now
      </a>
    );
  }

  if (!primaryHouseholdHasReceipts && scanReceiptHref) {
    return (
      <a
        href={scanReceiptHref}
        className="inline-flex items-center gap-2 border-[3px] border-dm-border-strong bg-dm-accent-warn-bg px-3 py-2 text-xs font-black uppercase tracking-wide text-dm-accent-warn-text shadow-[4px_4px_0_0_var(--dm-electric)] transition hover:-translate-y-px"
      >
        <span aria-hidden>☕</span>
        Need coffee? Ping room first
      </a>
    );
  }

  return (
    <span className="inline-flex items-center gap-2 border-[3px] border-dm-electric bg-dm-elevated px-3 py-2 text-[11px] font-bold uppercase tracking-wide text-dm-electric shadow-[3px_3px_0_0_var(--dm-border-strong)]">
      <span aria-hidden>⚡</span>
      Receipts syncing — splits next ship
    </span>
  );
}
