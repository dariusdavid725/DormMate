import OpenAI from "openai";

import type { ReceiptExtraction } from "@/lib/receipts/types";

const SYSTEM = `You read retail receipts for shared flats (students & young renters).
Return ONLY valid JSON with this shape (no markdown):
{
  "merchant": string | null,
  "total": number | null,
  "currency": string (ISO 4217 if obvious, else guess from locale symbols or default "EUR"),
  "purchased_at": string | null (ISO 8601 date if you can infer from receipt, else null),
  "line_items": [ { "name": string, "amount": number | null } ],
  "notes": string | null (short uncertainty note if handwriting/blur)
}
Rules:
- Prefer totals printed as TOTAL / SUM / AMOUNT DUE.
- If multiple currencies appear, pick the main transaction currency.
- line_items: main product lines; skip store loyalty boilerplate when unclear.
- Keep amounts as decimal numbers in major currency units (not cents).
- Be honest when unreadable: null fields are OK.`;

const DEFAULT_MODEL = "gpt-4o-mini";
const DEFAULT_TIMEOUT_MS = 18_000;
const MAX_RETRIES = 1;

function normalizeCurrency(value: unknown): string {
  if (typeof value !== "string") return "EUR";
  const cleaned = value.trim().toUpperCase();
  if (!cleaned) return "EUR";
  return cleaned.slice(0, 8);
}

function normalizeNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const cleaned = value.replace(",", ".").replace(/[^\d.-]/g, "").trim();
    if (!cleaned) return null;
    const parsed = Number(cleaned);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function coercePayload(raw: unknown): ReceiptExtraction {
  if (!raw || typeof raw !== "object") {
    return {
      merchant: null,
      total: null,
      currency: "EUR",
      purchased_at: null,
      line_items: [],
      notes: "Could not parse model output.",
    };
  }

  const o = raw as Record<string, unknown>;
  const lineItemsRaw = Array.isArray(o.line_items) ? o.line_items : [];

  return {
    merchant: typeof o.merchant === "string" ? o.merchant : null,
    total: normalizeNumber(o.total),
    currency: normalizeCurrency(o.currency),
    purchased_at: typeof o.purchased_at === "string" ? o.purchased_at : null,
    line_items: lineItemsRaw
      .filter((x): x is Record<string, unknown> => !!x && typeof x === "object")
      .map((li) => ({
        name: typeof li.name === "string" ? li.name : "Item",
        amount: normalizeNumber(li.amount),
      })),
    notes: typeof o.notes === "string" ? o.notes : undefined,
  };
}

export async function extractReceiptFromImageBase64(
  base64: string,
  mimeType: string,
): Promise<ReceiptExtraction> {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey?.trim()) {
    throw new Error("OPENAI_API_KEY_MISSING");
  }

  const openai = new OpenAI({ apiKey });
  const model = process.env.OPENAI_RECEIPT_MODEL ?? DEFAULT_MODEL;
  const timeoutMsRaw = Number(process.env.OPENAI_RECEIPT_TIMEOUT_MS ?? "");
  const timeoutMs =
    Number.isFinite(timeoutMsRaw) && timeoutMsRaw >= 5_000
      ? timeoutMsRaw
      : DEFAULT_TIMEOUT_MS;

  const dataUrl = `data:${mimeType};base64,${base64}`;

  let lastErr: Error | null = null;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const completion = await openai.chat.completions.create(
        {
          model,
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: SYSTEM },
            {
              role: "user",
              content: [
                {
                  type: "image_url",
                  image_url: { url: dataUrl },
                },
                {
                  type: "text",
                  text: "Extract receipt fields as JSON.",
                },
              ],
            },
          ],
        },
        { timeout: timeoutMs },
      );

      const rawText = completion.choices[0]?.message?.content;
      if (!rawText) {
        throw new Error("EMPTY_MODEL_RESPONSE");
      }

      let parsed: unknown;
      try {
        parsed = JSON.parse(rawText) as unknown;
      } catch {
        return coercePayload(null);
      }

      return coercePayload(parsed);
    } catch (error) {
      lastErr = error instanceof Error ? error : new Error(String(error));
      if (attempt >= MAX_RETRIES) {
        break;
      }
    }
  }
  throw lastErr ?? new Error("OPENAI_RECEIPT_FAILED");
}
