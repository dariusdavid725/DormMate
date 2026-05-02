"use server";

import { revalidatePath } from "next/cache";

import {
  PUBLIC_TRY_AGAIN,
  shouldExposeSupabaseError,
} from "@/lib/errors/public";
import type { ReceiptExtraction } from "@/lib/receipts/types";
import { createClient } from "@/lib/supabase/server";

export type SaveReceiptState = {
  error?: string;
  ok?: boolean;
};

export async function saveReceiptFromScan(
  _prev: SaveReceiptState | void,
  formData: FormData,
): Promise<SaveReceiptState> {
  const householdId = String(formData.get("household_id") ?? "").trim();
  const rawJson = String(formData.get("extraction_json") ?? "").trim();
  const filename = String(formData.get("filename") ?? "").trim() || null;

  if (!householdId || !rawJson) {
    return { error: "Missing data to save." };
  }

  let extraction: ReceiptExtraction;
  try {
    extraction = JSON.parse(rawJson) as ReceiptExtraction;
  } catch {
    return { error: "Invalid receipt data." };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Not signed in." };
  }

  let purchasedAt: string | null = null;
  if (extraction.purchased_at) {
    const d = new Date(extraction.purchased_at);
    if (!Number.isNaN(d.getTime())) {
      purchasedAt = d.toISOString();
    }
  }

  const { error } = await supabase.from("receipts").insert({
    household_id: householdId,
    created_by: user.id,
    merchant: extraction.merchant,
    total_amount: extraction.total,
    currency: extraction.currency || "EUR",
    purchased_at: purchasedAt,
    source_filename: filename,
    extraction: extraction as unknown as Record<string, unknown>,
  });

  if (error?.message) {
    console.error("[saveReceipt]", error.message);
    if (
      error.message.includes("relation") &&
      error.message.includes("does not exist")
    ) {
      return {
        error: shouldExposeSupabaseError()
          ? "Database table `receipts` missing — run the latest supabase/schema.sql."
          : PUBLIC_TRY_AGAIN,
      };
    }
    return {
      error: shouldExposeSupabaseError() ? error.message : PUBLIC_TRY_AGAIN,
    };
  }

  const path = `/dashboard/household/${householdId}`;
  revalidatePath(path);
  return { ok: true };
}
