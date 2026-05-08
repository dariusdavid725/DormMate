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
  compact?: boolean;
};

export function SidebarNavLink({ href, title, hint, exact, icon, compact }: Props) {
  const pathname = usePathname();
  const active = exact
    ? pathname === href
    : pathname === href || (href !== "/" && pathname.startsWith(href));

  return (
    <Link
      href={href}
      title={title}
      className={[
        compact
          ? "group relative rounded-2xl px-2.5 py-2.5 text-[14px] transition-all duration-200"
          : "rounded-xl px-3 py-2.5 text-[14px] transition-all duration-200",
        active
          ? "border border-[color-mix(in_srgb,var(--dm-electric)_45%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-electric)_10%,#fff)] font-semibold text-dm-text shadow-[0_6px_16px_rgba(45,41,37,0.08)]"
          : "border border-transparent text-dm-muted hover:border-[var(--dm-border-strong)] hover:bg-dm-surface hover:text-dm-text",
      ].join(" ")}
    >
      <div className={compact ? "flex items-center justify-center" : "flex min-w-0 items-center gap-2"}>
        {icon ? (
          <span
            className={[
              compact
                ? "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-[13px]"
                : "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-[12px]",
              active
                ? "bg-[color-mix(in_srgb,var(--dm-electric)_22%,#fff)] text-[var(--dm-electric-deep)]"
                : "bg-dm-surface-mid/70 text-dm-muted",
            ].join(" ")}
            aria-hidden
          >
            {icon}
          </span>
        ) : null}
        {compact ? (
          <span className="sr-only">{title}</span>
        ) : (
          <span className="min-w-0 flex-1">
            <span className="block truncate">{title}</span>
            {hint ? (
              <span className="mt-0.5 block truncate text-[11px] font-normal opacity-85">
                {hint}
              </span>
            ) : null}
          </span>
        )}
      </div>
      {compact ? (
        <span className="pointer-events-none absolute left-[calc(100%+0.45rem)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface px-2 py-1 text-[11px] font-semibold text-dm-text opacity-0 shadow-[0_8px_18px_rgba(45,41,37,0.12)] transition-opacity duration-150 group-hover:opacity-100">
          {title}
        </span>
      ) : null}
    </Link>
  );
}
