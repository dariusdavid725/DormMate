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
    <div className="flex gap-2 overflow-x-auto border-b border-dashed border-[var(--dm-border-strong)] bg-dm-bg-elev px-3 py-2 lg:hidden">
      {households.map((h) => {
        const href = `/dashboard/household/${h.id}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={h.id}
            href={href}
            prefetch
            className={[
              "cozy-note cozy-hover-wiggle shrink-0 rounded-[2px] px-3.5 py-1.5 text-xs font-semibold shadow-[var(--cozy-shadow-note)]",
              active ? "ring-2 ring-[rgba(90,122,95,0.35)] ring-offset-2 ring-offset-dm-bg-elev text-dm-text" : "text-dm-muted",
            ].join(" ")}
          >
            {h.name}
          </Link>
        );
      })}
    </div>
  );
}
