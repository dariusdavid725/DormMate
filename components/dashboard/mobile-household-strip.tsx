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
    <div className="flex gap-2 overflow-x-auto border-b border-[var(--dm-border-strong)] bg-dm-surface/70 px-4 py-2.5 backdrop-blur-md lg:hidden">
      {households.map((h) => {
        const href = `/dashboard/household/${h.id}`;
        const active =
          pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={h.id}
            href={href}
            prefetch
            className={[
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-[color-mix(in_srgb,var(--dm-electric)_16%,transparent)] text-dm-electric ring-1 ring-[var(--dm-border-strong)]"
                : "text-dm-muted hover:bg-dm-bg hover:text-dm-text",
            ].join(" ")}
          >
            {h.name}
          </Link>
        );
      })}
    </div>
  );
}
