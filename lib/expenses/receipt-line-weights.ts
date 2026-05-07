import type { ReceiptLineItem } from "@/lib/receipts/types";

export type LineAllocationPayload = {
  /** Who shares each receipt line (equal split within that line). */
  lines: Array<{ lineIndex: number; userIds: string[] }>;
  /** Who splits the remainder (total − allocated lines): tax, rounding, lines nobody picked. */
  remainderUserIds: string[];
};

/**
 * Each user's owed amount toward the payer (sums to ~total).
 */
export function computeOwedFromLineAllocations(args: {
  total: number;
  lineItems: ReceiptLineItem[];
  allocation: LineAllocationPayload;
}): Map<string, number> {
  const { total, lineItems, allocation } = args;
  const owed = new Map<string, number>();

  let allocatedSum = 0;

  for (let idx = 0; idx < lineItems.length; idx++) {
    const li = lineItems[idx];
    const amt =
      li.amount != null && Number.isFinite(li.amount) && li.amount >= 0 ?
        Number(li.amount)
      : 0;
    const row = allocation.lines.find((l) => l.lineIndex === idx);
    const users = [...new Set((row?.userIds ?? []).filter(Boolean))];
    if (users.length >= 1 && amt > 0) {
      allocatedSum += amt;
      const share = amt / users.length;
      for (const u of users) {
        owed.set(u, (owed.get(u) ?? 0) + share);
      }
    }
  }

  const remainder = Math.max(0, total - allocatedSum);
  const rest = [...new Set(allocation.remainderUserIds.filter(Boolean))];

  if (remainder > 0.009 && rest.length >= 1) {
    const rShare = remainder / rest.length;
    for (const u of rest) {
      owed.set(u, (owed.get(u) ?? 0) + rShare);
    }
  }

  return owed;
}

export function normalizeOwedMapForExpense(
  owed: Map<string, number>,
  epsilon = 0.02,
): { userIds: string[]; weights: number[]; sumOwed: number } {
  const entries = [...owed.entries()].filter(([, v]) => v > epsilon);
  const sumOwed = entries.reduce((s, [, v]) => s + v, 0);
  const userIds = entries.map(([u]) => u);
  const weights = entries.map(([, v]) => v);
  return { userIds, weights, sumOwed };
}
