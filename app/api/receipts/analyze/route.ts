import { NextResponse } from "next/server";

import { extractReceiptFromImageBase64 } from "@/lib/openai/extract-receipt";
import { createClient } from "@/lib/supabase/server";

const MAX_BYTES = 4 * 1024 * 1024;

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const householdId =
      typeof formData.get("household_id") === "string"
        ? String(formData.get("household_id")).trim()
        : "";
    const file = formData.get("file");

    if (!householdId || !(file instanceof Blob)) {
      return NextResponse.json(
        { error: "household_id and file are required." },
        { status: 400 },
      );
    }

    if (file.size > MAX_BYTES) {
      return NextResponse.json(
        { error: "Image too large (max 4 MB)." },
        { status: 413 },
      );
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { data: household, error: hhErr } = await supabase
      .from("households")
      .select("id")
      .eq("id", householdId)
      .maybeSingle();

    if (hhErr || !household) {
      return NextResponse.json({ error: "Household not found" }, { status: 404 });
    }

    const buf = Buffer.from(await file.arrayBuffer());
    const mimeType = file.type || "image/jpeg";
    if (!mimeType.startsWith("image/")) {
      return NextResponse.json(
        { error: "Only image uploads are supported." },
        { status: 400 },
      );
    }

    const base64 = buf.toString("base64");

    try {
      const extraction = await extractReceiptFromImageBase64(base64, mimeType);
      return NextResponse.json({
        extraction,
        filename: file instanceof File ? file.name : "upload",
      });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "OPENAI_API_KEY_MISSING") {
        return NextResponse.json(
          {
            error:
              "Receipt scanning is not configured yet (missing OPENAI_API_KEY on the server).",
          },
          { status: 503 },
        );
      }
      console.error("[api/receipts/analyze]", msg);
      return NextResponse.json(
        { error: "Could not read this receipt. Try a clearer photo." },
        { status: 502 },
      );
    }
  } catch (e) {
    console.error("[api/receipts/analyze]", e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
