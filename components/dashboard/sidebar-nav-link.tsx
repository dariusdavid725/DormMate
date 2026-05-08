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
        "rounded-xl px-3 py-2.5 text-[14px] transition-all duration-200",
        active
          ? "border border-[color-mix(in_srgb,var(--dm-electric)_45%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-electric)_10%,#fff)] font-semibold text-dm-text shadow-[0_6px_16px_rgba(45,41,37,0.08)]"
          : "border border-transparent text-dm-muted hover:border-[var(--dm-border-strong)] hover:bg-dm-surface hover:text-dm-text",
      ].join(" ")}
    >
      <div className="min-w-0">
        <span className="block truncate">{title}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[11px] font-normal opacity-85">
            {hint}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
