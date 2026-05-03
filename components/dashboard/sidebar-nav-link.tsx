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
        "group dm-hover-tap flex rounded-xl px-3 py-3 text-[14px] transition-[background,box-shadow,color] duration-200",
        active
          ? "bg-[linear-gradient(120deg,color-mix(in_srgb,var(--dm-electric)_18%,transparent),color-mix(in_srgb,var(--dm-surface-mid)_88%,transparent))] font-bold text-dm-text shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--dm-electric)_35%,transparent),0_12px_40px_-28px_var(--dm-electric-glow)]"
          : "text-dm-muted hover:bg-[color-mix(in_srgb,var(--dm-surface-mid)_80%,transparent)] hover:text-dm-text",
      ].join(" ")}
    >
      <div className="min-w-0 flex-1">
        <span className="block truncate">{title}</span>
        {hint ? (
          <span className="mt-0.5 block truncate text-[11px] font-medium text-dm-muted/85 group-hover:text-dm-muted">
            {hint}
          </span>
        ) : null}
      </div>
    </Link>
  );
}
