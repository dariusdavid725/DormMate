"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

type Item = { id: string; name: string };

export function MobileHouseholdStrip({ households }: { households: Item[] }) {
  const pathname = usePathname();
  const router = useRouter();

  if (households.length === 0) {
    return null;
  }

  const current = households.find((h) => {
    const href = `/dashboard/household/${h.id}`;
    return pathname === href || pathname.startsWith(`${href}/`);
  });

  return (
    <div className="border-b border-dashed border-[var(--dm-border-strong)] bg-dm-bg-elev px-3 py-2.5 lg:hidden">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
          Household
        </p>
        <label className="sr-only" htmlFor="mobile-household-switch">
          Switch household
        </label>
        <select
          id="mobile-household-switch"
          value={current?.id ?? ""}
          onChange={(e) => {
            const id = e.target.value;
            if (!id) return;
            router.push(`/dashboard/household/${id}`);
          }}
          className="max-w-[70vw] rounded-md border border-[var(--dm-border-strong)] bg-dm-surface px-2.5 py-1.5 text-xs font-medium text-dm-text"
        >
          {households.map((h) => (
            <option key={h.id} value={h.id}>
              {h.name}
            </option>
          ))}
        </select>
      </div>
      <div className="mt-2 flex gap-2 overflow-x-auto pb-0.5">
        {households.map((h) => {
          const href = `/dashboard/household/${h.id}`;
          const active = pathname === href || pathname.startsWith(`${href}/`);
          return (
            <Link
              key={h.id}
              href={href}
              prefetch
              aria-current={active ? "page" : undefined}
              className={[
                "cozy-note cozy-hover-wiggle shrink-0 rounded-[2px] px-3.5 py-1.5 text-xs font-semibold shadow-[var(--cozy-shadow-note)]",
                active
                  ? "ring-2 ring-[rgba(90,122,95,0.35)] ring-offset-2 ring-offset-dm-bg-elev text-dm-text"
                  : "text-dm-muted",
              ].join(" ")}
            >
              {h.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
