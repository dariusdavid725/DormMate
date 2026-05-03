"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = { id: string; name: string };

export function MobileHouseholdStrip({ households }: { households: Item[] }) {
  const pathname = usePathname();

  if (households.length === 0) {
    return null;
  }

  return (
    <div className="flex gap-2 overflow-x-auto border-b border-[var(--dm-border-strong)] bg-dm-surface px-3 py-2 lg:hidden">
      {households.map((h) => {
        const href = `/dashboard/household/${h.id}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={h.id}
            href={href}
            prefetch
            className={[
              "shrink-0 rounded-md px-3 py-1 text-xs font-medium",
              active
                ? "bg-[color-mix(in_srgb,var(--dm-electric)_12%,transparent)] text-dm-electric"
                : "text-dm-muted hover:text-dm-text",
            ].join(" ")}
          >
            {h.name}
          </Link>
        );
      })}
    </div>
  );
}
