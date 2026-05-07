import type { ReceiptLineItem, ReceiptRow } from "@/lib/receipts/types";

/** Normalize persisted extraction.line_items (jsonb) to typed rows. */
export function extractReceiptLines(r: ReceiptRow): ReceiptLineItem[] {
  const raw = r.extraction?.line_items;
  if (!Array.isArray(raw)) return [];
  const out: ReceiptLineItem[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const li = item as Record<string, unknown>;
    let amount: number | null =
      typeof li.amount === "number" && Number.isFinite(li.amount) ?
        li.amount
      : null;
    if (amount === null && typeof li.amount === "string") {
      const parsed = Number(String(li.amount).replace(",", "."));
      amount = Number.isFinite(parsed) ? parsed : null;
    }
    out.push({
      name: typeof li.name === "string" ? li.name : "Item",
      amount,
    });
  }
  return out;
}
