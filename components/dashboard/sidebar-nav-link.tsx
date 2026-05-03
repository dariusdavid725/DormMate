"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  title: string;
  hint?: string;
  exact?: boolean;
};

export function SidebarNavLink({ href, title, hint, exact }: Props) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href ||
      (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "group flex rounded-xl px-3 py-2 text-sm transition",
        active
          ? "bg-teal-600/15 font-medium text-teal-950 ring-1 ring-teal-600/25 dark:bg-teal-500/15 dark:text-teal-50 dark:ring-teal-400/30"
          : "text-stone-600 hover:bg-stone-100/90 hover:text-stone-900 dark:text-stone-400 dark:hover:bg-stone-900 dark:hover:text-stone-100",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[11px] font-normal uppercase tracking-wide text-stone-400 group-hover:text-stone-500 dark:text-stone-500 dark:group-hover:text-stone-400">
            {hint}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
