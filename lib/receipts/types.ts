/** Structured output from OpenAI vision + persisted `extraction` jsonb. */
export type ReceiptLineItem = {
  name: string;
  amount: number | null;
};

export type ReceiptExtraction = {
  merchant: string | null;
  total: number | null;
  currency: string;
  purchased_at: string | null;
  line_items: ReceiptLineItem[];
  notes?: string;
};

export type ReceiptRow = {
  id: string;
  household_id: string;
  created_by: string;
  merchant: string | null;
  total_amount: number | null;
  currency: string;
  purchased_at: string | null;
  source_filename: string | null;
  extraction: ReceiptExtraction & Record<string, unknown>;
  created_at: string;
};
