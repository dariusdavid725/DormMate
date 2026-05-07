"use client";

import { useMemo, useState } from "react";

import { createExpenseFromReceiptLineSplits } from "@/lib/expenses/actions";
import type { ReceiptLineItem } from "@/lib/receipts/types";
import type { LineAllocationPayload } from "@/lib/expenses/receipt-line-weights";
import { computeOwedFromLineAllocations } from "@/lib/expenses/receipt-line-weights";

type Member = { userId: string; label: string };

export function ReceiptLineSplitPanel({
  receiptId,
  householdId,
  totalAmount,
  currency,
  lineItems,
  memberOptions,
}: {
  receiptId: string;
  householdId: string;
  totalAmount: number;
  currency: string;
  lineItems: ReceiptLineItem[];
  memberOptions: Member[];
}) {
  const defaultRemainder = useMemo(
    () => memberOptions.map((m) => m.userId),
    [memberOptions],
  );

  const [linePick, setLinePick] = useState<Record<string, Set<string>>>(() => {
    const init: Record<string, Set<string>> = {};
    for (let i = 0; i < lineItems.length; i++) {
      init[String(i)] = new Set(memberOptions.map((m) => m.userId));
    }
    return init;
  });

  const [remainderUsers, setRemainderUsers] = useState<Set<string>>(
    () => new Set(defaultRemainder),
  );

  const [paidBy, setPaidBy] = useState<string>(
    () => memberOptions[0]?.userId ?? "",
  );

  const allocation = useMemo((): LineAllocationPayload => {
    const lines = lineItems.map((_, idx) => ({
      lineIndex: idx,
      userIds: [...(linePick[String(idx)] ?? new Set())],
    }));
    return {
      lines,
      remainderUserIds: [...remainderUsers],
    };
  }, [lineItems, linePick, remainderUsers]);

  const preview = useMemo(() => {
    const owed = computeOwedFromLineAllocations({
      total: totalAmount,
      lineItems,
      allocation,
    });
    return [...owed.entries()].filter(([, v]) => v > 0.01);
  }, [totalAmount, lineItems, allocation]);

  function toggleLineUser(lineIdx: number, userId: string) {
    const key = String(lineIdx);
    setLinePick((prev) => {
      const next = { ...prev };
      const set = new Set(next[key] ?? []);
      if (set.has(userId)) set.delete(userId);
      else set.add(userId);
      next[key] = set;
      return next;
    });
  }

  function toggleRemainder(userId: string) {
    setRemainderUsers((prev) => {
      const n = new Set(prev);
      if (n.has(userId)) n.delete(userId);
      else n.add(userId);
      return n;
    });
  }

  if (!memberOptions.length || totalAmount <= 0) return null;

  return (
    <details className="mt-3 rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/80 px-2 py-2">
      <summary className="cursor-pointer text-[11px] font-semibold text-dm-text">
        Split by items (who uses what)
      </summary>
      <p className="mt-2 text-[10px] leading-snug text-dm-muted">
        Tick who shares each line — for example only housemates who eat the bread pay that line.
        The rest of the receipt total (tax, rounding, lines nobody ticked) uses “Share remainder”.
      </p>

      <div className="mt-3 max-h-52 overflow-auto">
        <table className="w-full min-w-[280px] border-collapse text-[11px]">
          <thead>
            <tr className="border-b border-[var(--dm-border-strong)] text-left text-dm-muted">
              <th className="py-1 pr-2 font-medium">Item</th>
              <th className="py-1 pr-2 font-medium tabular-nums">Amt</th>
              {memberOptions.map((m) => (
                <th key={m.userId} className="px-0.5 py-1 text-center font-medium">
                  <span className="line-clamp-2 max-w-[4rem]">{m.label}</span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {lineItems.map((li, idx) => (
              <tr key={`ln-${idx}`} className="border-b border-dashed border-[rgba(91,79,71,0.12)]">
                <td className="py-1 pr-2 align-top text-dm-text">{li.name}</td>
                <td className="py-1 pr-2 align-top tabular-nums text-dm-muted">
                  {li.amount != null ? li.amount.toFixed(2) : "—"}
                </td>
                {memberOptions.map((m) => (
                  <td key={`${idx}-${m.userId}`} className="px-0.5 py-1 text-center">
                    <input
                      type="checkbox"
                      checked={(linePick[String(idx)] ?? new Set()).has(m.userId)}
                      onChange={() => toggleLineUser(idx, m.userId)}
                      aria-label={`${m.label} shares ${li.name}`}
                    />
                  </td>
                ))}
              </tr>
            ))}
            <tr className="bg-dm-bg/40">
              <td className="py-1 pr-2 font-semibold text-dm-text">Share remainder</td>
              <td className="py-1 pr-2 text-dm-muted">tax · rest</td>
              {memberOptions.map((m) => (
                <td key={`rem-${m.userId}`} className="px-0.5 py-1 text-center">
                  <input
                    type="checkbox"
                    checked={remainderUsers.has(m.userId)}
                    onChange={() => toggleRemainder(m.userId)}
                    aria-label={`${m.label} shares remainder`}
                  />
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="flex items-center gap-1 text-[10px] text-dm-muted">
          Paid by
          <select
            value={paidBy}
            onChange={(e) => setPaidBy(e.target.value)}
            className="rounded border border-[var(--dm-border-strong)] bg-dm-bg/70 px-1.5 py-1 text-[11px] text-dm-text"
          >
            {memberOptions.map((m) => (
              <option key={m.userId} value={m.userId}>
                {m.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {preview.length > 0 ? (
        <ul className="mt-2 space-y-0.5 text-[10px] text-dm-muted">
          {preview.map(([uid, amt]) => (
            <li key={uid} className="tabular-nums">
              {memberOptions.find((m) => m.userId === uid)?.label ?? uid.slice(0, 6)} ·{" "}
              <span className="text-dm-text">{amt.toFixed(2)}</span> {currency}
            </li>
          ))}
        </ul>
      ) : null}

      <form action={createExpenseFromReceiptLineSplits} className="mt-3">
        <input type="hidden" name="receipt_id" value={receiptId} />
        <input type="hidden" name="household_id" value={householdId} />
        <input type="hidden" name="paid_by_user_id" value={paidBy} />
        <input type="hidden" name="allocation_json" value={JSON.stringify(allocation)} />
        <button
          type="submit"
          className="rounded-md bg-dm-electric px-2.5 py-1.5 text-[11px] font-semibold text-white hover:brightness-105"
        >
          Create expense from item split
        </button>
      </form>
    </details>
  );
}
