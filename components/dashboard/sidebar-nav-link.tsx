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
        "group flex rounded-none border-[3px] px-3 py-2.5 font-mono text-sm font-semibold uppercase tracking-wide transition",
        active
          ? "border-dm-electric bg-dm-elevated font-black text-dm-text shadow-[4px_4px_0_0_var(--dm-border-strong)]"
          : "border-transparent text-dm-muted hover:border-dm-electric/40 hover:bg-dm-surface hover:text-dm-text",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[10px] font-semibold uppercase tracking-wide text-dm-muted/90 group-hover:text-dm-muted">
            {hint}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
