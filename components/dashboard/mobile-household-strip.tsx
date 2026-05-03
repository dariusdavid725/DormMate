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
    <div className="flex gap-2 overflow-x-auto border-b-[3px] border-dm-electric bg-dm-surface px-4 py-3 lg:hidden">
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
              "shrink-0 border-[3px] px-3 py-2 font-mono text-[11px] font-bold uppercase tracking-wide transition",
              active
                ? "border-dm-electric bg-dm-electric font-black text-white shadow-[3px_3px_0_0_var(--dm-border-strong)]"
                : "border-dm-muted/35 bg-dm-bg text-dm-muted hover:border-dm-electric hover:text-dm-text",
            ].join(" ")}
          >
            {h.name}
          </Link>
        );
      })}
    </div>
  );
}
