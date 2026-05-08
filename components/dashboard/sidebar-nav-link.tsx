"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";

type Props = {
  href: string;
  title: string;
  hint?: string;
  exact?: boolean;
  icon?: ReactNode;
};

export function SidebarNavLink({ href, title, hint, exact, icon }: Props) {
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
      <div className="flex min-w-0 items-center gap-2">
        {icon ? (
          <span
            className={[
              "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[12px]",
              active
                ? "bg-[color-mix(in_srgb,var(--dm-electric)_22%,#fff)] text-[var(--dm-electric-deep)]"
                : "bg-dm-surface-mid/70 text-dm-muted",
            ].join(" ")}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        <span className="min-w-0 flex-1">
          <span className="block truncate">{title}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[11px] font-normal opacity-85">
            {hint}
          </span>
        ) : null}
        </span>
      </div>
    </Link>
  );
}
