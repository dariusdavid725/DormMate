import { ReceiptLineSplitPanel } from "@/components/receipts/receipt-line-split-panel";
import { formatMoneySafe } from "@/lib/currency/format-money";
import {
  createExpenseFromReceiptSelectedMembers,
  createExpenseFromReceiptSplitAll,
} from "@/lib/expenses/actions";
import { extractReceiptLines } from "@/lib/receipts/parse-extraction-lines";
import { shoppingCategoryLabel } from "@/lib/receipts/shopping-categories";
import type { ReceiptRow } from "@/lib/receipts/types";

function fmtWhen(iso: string) {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function ReceiptList({
  receipts,
  emptyHint,
  enableSplitAllAction = false,
  linkedReceiptIds = [],
  memberOptions = [],
}: {
  receipts: ReceiptRow[];
  emptyHint: string;
  enableSplitAllAction?: boolean;
  linkedReceiptIds?: string[];
  memberOptions?: Array<{ userId: string; label: string }>;
}) {
  if (receipts.length === 0) {
    return (
      <div className="cozy-note cozy-tilt-xs px-4 py-10 text-center text-[13px] text-dm-muted shadow-[var(--cozy-shadow-note)]">
        {emptyHint}
      </div>
    );
  }

  return (
    <div className="cozy-receipt cozy-tilt-xs overflow-hidden">
      <ul className="divide-y divide-dashed divide-[rgba(91,79,71,0.18)] px-4 py-3">
        {receipts.map((r) => {
          const alreadySplit = linkedReceiptIds.includes(r.id);
          const lines = extractReceiptLines(r);
          const notes =
            typeof r.extraction?.notes === "string" ? r.extraction.notes : "";
          const catLabel = shoppingCategoryLabel(
            r.shopping_category ??
              (typeof r.extraction?.shopping_category === "string"
                ? r.extraction.shopping_category
                : null),
          );

          return (
            <li key={r.id} className="cozy-hover-wiggle py-3 first:pt-0">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold text-dm-text">
                      {r.merchant ?? "Unknown store"}
                    </p>
                    {catLabel ?
                      <span className="shrink-0 rounded-full bg-dm-bg/80 px-2 py-px text-[10px] font-semibold uppercase tracking-wide text-dm-muted ring-1 ring-[var(--dm-border-strong)]">
                        {catLabel}
                      </span>
                    : null}
                  </div>
                  <p className="mt-1 text-[11px] text-dm-muted tabular-nums">
                    Added {fmtWhen(r.created_at)}
                    {r.source_filename ? ` · ${r.source_filename}` : ""}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-sm font-semibold tabular-nums text-dm-text">
                    {r.total_amount != null
                      ? formatMoneySafe(r.total_amount, r.currency)
                      : "—"}
                  </p>
                  {r.purchased_at ? (
                    <p className="mt-1 text-[10px] text-dm-muted">
                      Purchase ·{" "}
                      {new Intl.DateTimeFormat(undefined, {
                        dateStyle: "medium",
                      }).format(new Date(r.purchased_at))}
                    </p>
                  ) : null}
                  {enableSplitAllAction &&
                  r.total_amount != null &&
                  r.total_amount > 0 &&
                  !alreadySplit ? (
                    <div className="mt-2 space-y-2 text-left">
                      <form action={createExpenseFromReceiptSplitAll}>
                        <input type="hidden" name="receipt_id" value={r.id} />
                        <input
                          type="hidden"
                          name="household_id"
                          value={r.household_id}
                        />
                        <button
                          type="submit"
                          className="text-[11px] font-semibold text-dm-electric hover:underline"
                        >
                          Split cost with everyone
                        </button>
                      </form>

                      {memberOptions.length > 0 ? (
                        <details className="rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface/70 px-2 py-2">
                          <summary className="cursor-pointer text-[11px] font-semibold text-dm-text">
                            Split only with some people
                          </summary>
                          <form
                            action={createExpenseFromReceiptSelectedMembers}
                            className="mt-2 space-y-2"
                          >
                            <input type="hidden" name="receipt_id" value={r.id} />
                            <input
                              type="hidden"
                              name="household_id"
                              value={r.household_id}
                            />
                            <p className="text-[10px] text-dm-muted">
                              Choose who shared this shopping trip. Uses{" "}
                              <strong className="text-dm-text">{r.currency}</strong>{" "}
                              from the receipt.
                            </p>
                            <div className="max-h-28 space-y-1 overflow-auto">
                              {memberOptions.map((m) => (
                                <label
                                  key={`${r.id}-${m.userId}`}
                                  className="flex items-center gap-2 text-[11px] text-dm-text"
                                >
                                  <input
                                    type="checkbox"
                                    name="split_user_ids"
                                    value={m.userId}
                                    defaultChecked
                                  />
                                  <span>{m.label}</span>
                                </label>
                              ))}
                            </div>
                            <div>
                              <label className="text-[10px] font-semibold uppercase tracking-wide text-dm-muted">
                                Who paid
                              </label>
                              <select
                                name="paid_by_user_id"
                                defaultValue={r.created_by}
                                className="mt-1 w-full rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-2 py-1.5 text-[11px] text-dm-text"
                              >
                                {memberOptions.map((m) => (
                                  <option key={`${r.id}-paid-${m.userId}`} value={m.userId}>
                                    {m.label}
                                  </option>
                                ))}
                              </select>
                            </div>
                            <button
                              type="submit"
                              className="rounded-md bg-dm-electric px-2.5 py-1.5 text-[11px] font-semibold text-white"
                            >
                              Create expense from receipt
                            </button>
                          </form>
                        </details>
                      ) : null}
                    </div>
                  ) : null}
                  {enableSplitAllAction && alreadySplit ? (
                    <p className="mt-2 text-[11px] font-semibold text-dm-muted">
                      Already turned into an expense — see Money tab.
                    </p>
                  ) : null}
                </div>
              </div>

              {(lines.length > 0 || notes) ? (
                <details className="mt-3 w-full border-t border-dashed border-[rgba(91,79,71,0.18)] pt-2">
                  <summary className="cursor-pointer text-[11px] font-semibold text-dm-electric hover:underline">
                    {lines.length > 0
                      ? `Show ${lines.length} line${lines.length === 1 ? "" : "s"} from scan`
                      : "Notes from scan"}
                  </summary>
                  {lines.length > 0 ? (
                    <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-[13px]">
                      {lines.map((li, i) => (
                        <li
                          key={`${r.id}-li-${i}`}
                          className="flex justify-between gap-2 border-b border-dashed border-[rgba(91,79,71,0.08)] py-1 last:border-b-0"
                        >
                          <span className="min-w-0 text-dm-text">{li.name}</span>
                          <span className="shrink-0 tabular-nums text-dm-muted">
                            {li.amount != null
                              ? `${li.amount.toFixed(2)} ${r.currency}`
                              : "—"}
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {notes ? (
                    <p className="mt-2 text-[12px] text-dm-muted">{notes}</p>
                  ) : null}
                </details>
              ) : null}

              {enableSplitAllAction &&
              !alreadySplit &&
              lines.length > 0 &&
              memberOptions.length > 0 &&
              r.total_amount != null &&
              r.total_amount > 0 ? (
                <ReceiptLineSplitPanel
                  receiptId={r.id}
                  householdId={r.household_id}
                  totalAmount={Number(r.total_amount)}
                  currency={r.currency}
                  lineItems={lines}
                  memberOptions={memberOptions}
                />
              ) : null}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
