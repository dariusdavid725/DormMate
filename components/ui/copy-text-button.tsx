"use client";

import { useState } from "react";

export function CopyTextButton({
  text,
  label,
  className,
}: {
  text: string;
  label: string;
  className?: string;
}) {
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);

  async function onCopy() {
    try {
      await navigator.clipboard.writeText(text);
      setErr(false);
      setDone(true);
      window.setTimeout(() => setDone(false), 2000);
    } catch (e: unknown) {
      console.error("[copy]", e);
      setErr(true);
      window.setTimeout(() => setErr(false), 2500);
    }
  }

  return (
    <button
      type="button"
      onClick={() => {
        void onCopy();
      }}
      className={
        className ??
        "touch-manipulation rounded-md border border-[var(--dm-border-strong)] bg-dm-bg/80 px-2 py-1 text-[10px] font-semibold text-dm-text hover:border-dm-electric"
      }
    >
      {done ? "Copied" : err ? "Copy failed" : label}
    </button>
  );
}
