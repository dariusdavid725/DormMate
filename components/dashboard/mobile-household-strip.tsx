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
    <div className="flex gap-2 overflow-x-auto border-b border-stone-200 bg-[#faf8f5] px-4 py-2.5 lg:hidden dark:border-stone-800 dark:bg-stone-950">
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
              "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition",
              active
                ? "bg-gradient-to-r from-teal-600 to-emerald-600 text-white shadow-md shadow-teal-900/15 dark:shadow-black/40"
                : "bg-white text-stone-700 shadow-sm ring-1 ring-stone-200/90 hover:bg-amber-50 dark:bg-stone-900 dark:text-stone-200 dark:ring-stone-700 dark:hover:bg-stone-800",
            ].join(" ")}
          >
            {h.name}
          </Link>
        );
      })}
    </div>
  );
}
