"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useActionState,
} from "react";

import {
  saveReceiptFromScan,
  type SaveReceiptState,
} from "@/lib/receipts/actions";
import type { ReceiptExtraction } from "@/lib/receipts/types";

type Phase = "idle" | "reading" | "preview" | "saved";

const saveInitial: SaveReceiptState = {};

export function ReceiptScannerPanel({ householdId }: { householdId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    extraction: ReceiptExtraction;
    filename: string;
  } | null>(null);

  const onScanSaved = useCallback(() => {
    setPreview(null);
    setPhase("saved");
    setTimeout(() => setPhase("idle"), 2200);
  }, []);

  async function onPickFile(file: File | undefined) {
    if (!file) return;
    setError(null);
    setPhase("reading");

    const fd = new FormData();
    fd.set("household_id", householdId);
    fd.set("file", file);

    try {
      const res = await fetch("/api/receipts/analyze", {
        method: "POST",
        body: fd,
      });
      const json = (await res.json()) as {
        extraction?: ReceiptExtraction;
        filename?: string;
        error?: string;
      };

      if (!res.ok) {
        setError(json.error ?? "Could not read receipt.");
        setPhase("idle");
        setPreview(null);
        return;
      }

      if (!json.extraction) {
        setError("Unexpected response.");
        setPhase("idle");
        return;
      }

      setPreview({
        extraction: json.extraction,
        filename: json.filename ?? file.name,
      });
      setPhase("preview");
    } catch {
      setError("Network error — try again.");
      setPhase("idle");
      setPreview(null);
    }
  }

  return (
    <div className="rounded-3xl border border-stone-200/90 bg-gradient-to-br from-white via-amber-50/40 to-teal-50/50 p-6 shadow-sm dark:border-stone-700 dark:from-stone-900 dark:via-stone-900 dark:to-teal-950/40">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-50">
            Snap a receipt
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Take a photo under decent light — we extract totals so nobody has to
            type rows after a grocery run. Uses OpenAI vision when configured on
            the server.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={phase === "reading"}
          className="shrink-0 rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-900/15 transition hover:from-teal-500 hover:to-emerald-500 disabled:opacity-60 dark:shadow-black/40"
        >
          {phase === "reading" ? "Reading…" : "Upload image"}
        </button>
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            void onPickFile(f);
            e.target.value = "";
          }}
        />
      </div>

      {error ? (
        <p
          role="alert"
          className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-900 dark:border-rose-900/60 dark:bg-rose-950/50 dark:text-rose-100"
        >
          {error}
        </p>
      ) : null}

      {phase === "preview" && preview ? (
        <ReceiptPreview
          householdId={householdId}
          filename={preview.filename}
          extraction={preview.extraction}
          onCancel={() => {
            setPreview(null);
            setPhase("idle");
          }}
          onSaved={onScanSaved}
        />
      ) : null}

      {phase === "saved" ? (
        <p className="mt-4 text-sm font-medium text-teal-800 dark:text-teal-200">
          Saved to this household — nice one.
        </p>
      ) : null}
    </div>
  );
}

function ReceiptPreview({
  householdId,
  filename,
  extraction,
  onCancel,
  onSaved,
}: {
  householdId: string;
  filename: string;
  extraction: ReceiptExtraction;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [state, formAction, pending] = useActionState(
    saveReceiptFromScan,
    saveInitial,
  );
  const fired = useRef(false);

  useEffect(() => {
    if (state?.ok && !fired.current) {
      fired.current = true;
      onSaved();
    }
  }, [state, onSaved]);

  return (
    <form action={formAction} className="mt-6 space-y-4 rounded-2xl border border-stone-200 bg-white/90 p-5 dark:border-stone-700 dark:bg-stone-950/80">
      <input type="hidden" name="household_id" value={householdId} />
      <input type="hidden" name="filename" value={filename} />
      <input
        type="hidden"
        name="extraction_json"
        value={JSON.stringify(extraction)}
      />

      {state?.error ? (
        <p className="text-sm text-rose-700 dark:text-rose-300">{state.error}</p>
      ) : null}

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Merchant
          </dt>
          <dd className="font-medium text-stone-900 dark:text-stone-100">
            {extraction.merchant ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Total
          </dt>
          <dd className="font-medium text-stone-900 dark:text-stone-100">
            {extraction.total != null
              ? `${extraction.total.toFixed(2)} ${extraction.currency}`
              : "—"}
          </dd>
        </div>
      </dl>

      {extraction.line_items.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500 dark:text-stone-400">
            Lines
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-stone-700 dark:text-stone-300">
            {extraction.line_items.slice(0, 12).map((li, i) => (
              <li key={`${li.name}-${i}`} className="flex justify-between gap-2">
                <span className="min-w-0 truncate">{li.name}</span>
                <span className="shrink-0 tabular-nums text-stone-600 dark:text-stone-400">
                  {li.amount != null ? li.amount.toFixed(2) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {extraction.notes ? (
        <p className="text-xs text-stone-500 dark:text-stone-400">
          {extraction.notes}
        </p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-2xl bg-teal-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-teal-500 disabled:opacity-60"
        >
          {pending ? "Saving…" : "Save to household"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-2xl border border-stone-300 px-4 py-2 text-sm font-semibold text-stone-700 hover:bg-stone-50 dark:border-stone-600 dark:text-stone-200 dark:hover:bg-stone-800"
        >
          Discard
        </button>
      </div>
    </form>
  );
}
