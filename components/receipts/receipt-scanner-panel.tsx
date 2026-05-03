"use client";

import {
  useCallback,
  useEffect,
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

export function ReceiptScannerPanel({ householdId }: { householdId: string }) {
  const router = useRouter();
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
    <div className="dm-card-surface overflow-hidden rounded-[1.35rem] p-6 lg:p-7 ring-1 ring-[color-mix(in_srgb,var(--dm-accent)_18%,transparent)]">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="text-xl font-black text-dm-text">Beam that receipt 📸</h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-dm-muted">
            Straight-ish angles, forgiving light — we decode totals fast so thumbs don&apos;t
            ice over retyping ketchup prices.
          </p>
        </div>
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={phase === "reading"}
          className="dm-hover-tap dm-scan-hero shrink-0 rounded-2xl px-5 py-2.5 text-sm font-black tracking-tight text-[#071018] transition-[filter,transform] duration-200 hover:brightness-110 disabled:pointer-events-none disabled:opacity-50"
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
          className="dm-fade-in-up mt-4 rounded-2xl border border-dm-danger/40 bg-red-500/[0.08] px-4 py-3 text-sm text-dm-danger"
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
          className="dm-fade-in-up mt-5 flex flex-wrap items-center gap-3 rounded-2xl border border-[color-mix(in_srgb,var(--dm-accent)_45%,var(--dm-border))] bg-[color-mix(in_srgb,var(--dm-accent)_10%,transparent)] px-4 py-3 text-sm font-medium text-dm-text"
        >
          <span
            className="dm-flash-check flex h-8 w-8 items-center justify-center rounded-full bg-dm-accent text-sm font-bold text-dm-accent-ink"
            aria-hidden
          >
            ✓
          </span>
          <span>
            Saved — it&apos;ll show up in House activity right away on Home.
          </span>
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

  useEffect(() => {
    if (state?.ok && !fired.current) {
      fired.current = true;
      onSaved();
    }
  }, [state, onSaved]);

  return (
    <form
      action={formAction}
      className="dm-card-surface space-y-4 rounded-[1.2rem] p-5 lg:p-6"
    >
      <input type="hidden" name="household_id" value={householdId} />
      <input type="hidden" name="filename" value={filename} />
      <input
        type="hidden"
        name="extraction_json"
        value={JSON.stringify(extraction)}
      />

      {state?.error ? (
        <p className="text-sm font-medium text-dm-danger">{state.error}</p>
      ) : null}

      <dl className="grid gap-3 text-sm sm:grid-cols-2">
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            Merchant
          </dt>
          <dd className="font-medium text-dm-text">{extraction.merchant ?? "—"}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            Total
          </dt>
          <dd className="font-mono font-semibold tabular-nums text-dm-accent">
            {extraction.total != null
              ? `${extraction.total.toFixed(2)} ${extraction.currency}`
              : "—"}
          </dd>
        </div>
      </dl>

      {extraction.line_items.length > 0 ? (
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
            Lines
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
          className="dm-hover-tap rounded-xl bg-gradient-to-br from-dm-accent to-[color-mix(in_srgb,var(--dm-accent)_70%,var(--dm-electric))] px-4 py-2.5 text-sm font-black text-[var(--dm-accent-ink)] shadow-[0_14px_40px_-14px_color-mix(in_srgb,var(--dm-accent)_50%,transparent)] transition-[filter] duration-200 hover:brightness-110 disabled:pointer-events-none disabled:opacity-55"
        >
          {pending ? "Saving…" : "Save to household"}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="dm-btn-secondary dm-hover-tap text-sm font-bold"
        >
          Discard
        </button>
      </div>
    </form>
  );
}
