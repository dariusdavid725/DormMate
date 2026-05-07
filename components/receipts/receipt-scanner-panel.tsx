"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useActionState,
} from "react";
import { useRouter } from "next/navigation";

import {
  saveReceiptFromScan,
  type SaveReceiptState,
} from "@/lib/receipts/actions";
import type { ReceiptExtraction } from "@/lib/receipts/types";

type Phase = "idle" | "reading" | "preview" | "saved";

const saveInitial: SaveReceiptState = {};

const COMMON_CURRENCIES = ["RON", "EUR", "USD", "GBP", "BGN", "PLN", "HUF"];

export function ReceiptScannerPanel({ householdId }: { householdId: string }) {
  const router = useRouter();
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState<{
    extraction: ReceiptExtraction;
    filename: string;
  } | null>(null);

  const onScanSaved = useCallback(() => {
    setPreview(null);
    setPhase("saved");
    router.refresh();
    window.setTimeout(() => setPhase("idle"), 3200);
  }, [router]);

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
    <div className="cozy-poster cozy-tilt-xs p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="font-cozy-display text-3xl text-dm-text">Scan a receipt</h3>
          <p className="mt-1 max-w-md text-[13px] text-dm-muted">
            Upload a photo of the receipt. We read the total and line items — then you can save it to this household.
          </p>
        </div>
        <div className="shrink-0 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={phase === "reading"}
            className="hidden sm:inline-flex dm-scan-hero rounded-md px-4 py-2 text-sm font-semibold text-[#fffaf5] hover:brightness-105 disabled:pointer-events-none disabled:opacity-50"
          >
            {phase === "reading" ? "Reading…" : "Upload image"}
          </button>
          <button
            type="button"
            onClick={() => galleryInputRef.current?.click()}
            disabled={phase === "reading"}
            className="sm:hidden rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-xs font-semibold text-dm-text disabled:pointer-events-none disabled:opacity-50"
          >
            Gallery
          </button>
          <button
            type="button"
            onClick={() => cameraInputRef.current?.click()}
            disabled={phase === "reading"}
            className="sm:hidden dm-scan-hero rounded-md px-3 py-2 text-xs font-semibold text-[#fffaf5] disabled:pointer-events-none disabled:opacity-50"
          >
            Camera
          </button>
        </div>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="sr-only"
          onChange={(e) => {
            const f = e.target.files?.[0];
            void onPickFile(f);
            e.target.value = "";
          }}
        />
        <input
          ref={cameraInputRef}
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
          className="mt-4 rounded-md border border-dm-danger/45 bg-dm-surface px-4 py-3 text-sm text-dm-danger"
        >
          {error}
        </p>
      ) : null}

      {phase === "preview" && preview ? (
        <div className="dm-fade-in-up mt-6">
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
        </div>
      ) : null}

      {phase === "saved" ? (
        <div
          role="status"
          aria-live="polite"
          className="cozy-note cozy-tilt-xs mt-4 px-3 py-2.5 text-sm text-dm-text shadow-[var(--cozy-shadow-note)]"
        >
          Saved — it appears in the list below and in Home activity.
        </div>
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
  const [currency, setCurrency] = useState(() =>
    (extraction.currency || "EUR").toUpperCase().slice(0, 8),
  );

  useEffect(() => {
    setCurrency((extraction.currency || "EUR").toUpperCase().slice(0, 8));
  }, [extraction]);

  const mergedExtraction = useMemo(
    (): ReceiptExtraction => ({ ...extraction, currency }),
    [extraction, currency],
  );

  useEffect(() => {
    if (state?.ok && !fired.current) {
      fired.current = true;
      onSaved();
    }
  }, [state, onSaved]);

  return (
    <form
      action={formAction}
      className="cozy-receipt space-y-4 p-4"
    >
      <input type="hidden" name="household_id" value={householdId} />
      <input type="hidden" name="filename" value={filename} />
      <input
        type="hidden"
        name="extraction_json"
        value={JSON.stringify(mergedExtraction)}
      />

      {state?.error ? (
        <p className="text-sm font-medium text-dm-danger">{state.error}</p>
      ) : null}

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            Store
          </dt>
          <dd className="font-medium text-dm-text">{extraction.merchant ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            Currency
          </dt>
          <dd className="mt-1">
            <label className="sr-only" htmlFor="receipt-currency">
              Receipt currency
            </label>
            <select
              id="receipt-currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value.toUpperCase().slice(0, 8))}
              className="w-full max-w-[11rem] rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/70 px-2 py-1.5 text-sm text-dm-text"
            >
              {COMMON_CURRENCIES.includes(currency) ? null : (
                <option value={currency}>{currency}</option>
              )}
              {COMMON_CURRENCIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-dm-muted">
              Fix here if the scan guessed wrong (e.g. Romanian receipts should be RON).
            </p>
          </dd>
        </div>
        <div className="sm:col-span-2">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            Total
          </dt>
          <dd className="font-mono font-semibold tabular-nums text-dm-accent">
            {extraction.total != null
              ? `${extraction.total.toFixed(2)} ${currency}`
              : "—"}
          </dd>
        </div>
      </dl>

      {extraction.line_items.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            Lines from scan
          </p>
          <ul className="mt-2 max-h-40 space-y-1 overflow-y-auto text-sm text-dm-muted">
            {extraction.line_items.slice(0, 12).map((li, i) => (
              <li key={`${li.name}-${i}`} className="flex justify-between gap-2">
                <span className="min-w-0 truncate text-dm-text">{li.name}</span>
                <span className="shrink-0 tabular-nums">
                  {li.amount != null ? li.amount.toFixed(2) : "—"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {extraction.notes ? (
        <p className="text-xs text-dm-muted">{extraction.notes}</p>
      ) : null}

      <div className="flex flex-wrap gap-2 pt-2">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-dm-electric px-4 py-2 text-sm font-semibold text-white hover:brightness-105 disabled:pointer-events-none disabled:opacity-55"
        >
          {pending ? "Saving…" : "Save receipt"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-[var(--dm-border-strong)] px-4 py-2 text-sm font-medium text-dm-muted hover:border-dm-electric hover:text-dm-text"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
