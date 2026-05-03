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
        "group flex rounded-xl px-3 py-3.5 text-[14px] transition",
        active
          ? "bg-[color-mix(in_srgb,var(--dm-electric)_12%,transparent)] font-semibold text-dm-text ring-1 ring-[var(--dm-border-strong)]"
          : "text-dm-muted hover:bg-dm-surface hover:text-dm-text",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[11px] font-normal text-dm-muted/80">
            {hint}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
