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
    <div className="flex gap-2 overflow-x-auto border-b border-[color-mix(in_srgb,var(--dm-electric)_14%,transparent)] bg-[color-mix(in_srgb,var(--dm-surface)_88%,transparent)] px-4 py-2 backdrop-blur-lg lg:hidden">
      {households.map((h) => {
        const href = `/dashboard/household/${h.id}`;
        const active = pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={h.id}
            href={href}
            prefetch
            className={[
              "shrink-0 rounded-full px-4 py-1.5 text-xs font-bold transition duration-200",
              active
                ? "bg-[color-mix(in_srgb,var(--dm-electric)_16%,transparent)] text-dm-electric ring-1 ring-[color-mix(in_srgb,var(--dm-electric)_32%,transparent)] shadow-[0_0_26px_-10px_var(--dm-electric-glow)]"
                : "bg-[color-mix(in_srgb,var(--dm-bg)_65%,transparent)] text-dm-muted hover:text-dm-text",
            ].join(" ")}
          >
            {h.name}
          </Link>
        );
      })}
    </div>
  );
}
