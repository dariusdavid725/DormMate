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
    : pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      className={[
        "flex rounded-lg px-2.5 py-2 text-[14px] transition-colors duration-150",
        active
          ? "border-l-2 border-dm-electric bg-[color-mix(in_srgb,var(--dm-electric)_8%,transparent)] font-medium text-dm-text"
          : "border-l-2 border-transparent text-dm-muted hover:bg-dm-surface hover:text-dm-text",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1 pl-1">
        <span className="block truncate">{title}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[11px] text-dm-muted">
            {hint}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
