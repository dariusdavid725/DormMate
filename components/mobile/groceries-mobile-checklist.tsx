"use client";

import { useCallback, useMemo, useState } from "react";

const DEFAULT_ITEMS = ["Oat milk", "Bread", "Eggs", "Coffee"];

export function GroceriesMobileChecklist() {
  const [items] = useState(() => DEFAULT_ITEMS);
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = useCallback((label: string) => {
    setChecked((prev) => ({ ...prev, [label]: !prev[label] }));
  }, []);

  const counts = useMemo(() => {
    const done = items.filter((i) => checked[i]).length;
    return { done, total: items.length };
  }, [checked, items]);

  return (
    <div className="space-y-4">
      <p className="text-[13px] leading-relaxed text-dm-muted">
        Shared list is coming soon — for now, tick things off locally while you shop (nothing is saved to the
        server yet).
      </p>
      <p className="text-[12px] font-semibold uppercase tracking-wide text-dm-muted">
        This trip · {counts.done}/{counts.total}
      </p>
      <ul className="divide-y divide-dashed divide-[var(--dm-border-strong)] rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/95 shadow-[var(--cozy-shadow-note)]">
        {items.map((label) => {
          const isOn = !!checked[label];
          return (
            <li key={label}>
              <label className="flex cursor-pointer items-center gap-3 px-4 py-3.5 touch-manipulation min-h-[52px] active:bg-dm-elevated/40">
                <input
                  type="checkbox"
                  checked={isOn}
                  onChange={() => toggle(label)}
                  className="h-5 w-5 shrink-0 rounded border-[var(--dm-border-strong)] text-[var(--dm-electric)] accent-[var(--dm-electric)]"
                />
                <span
                  className={`text-[15px] font-medium leading-snug ${isOn ? "text-dm-muted line-through" : "text-dm-text"}`}
                >
                  {label}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
