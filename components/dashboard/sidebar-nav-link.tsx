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
        "rounded-md px-2.5 py-2 text-[14px] transition-all duration-200",
        active
          ? "border border-[rgba(90,122,95,0.35)] bg-dm-surface font-semibold text-dm-text shadow-[1px_2px_0_rgba(54,47,40,0.06)]"
          : "border border-transparent text-dm-muted hover:border-dashed hover:border-[var(--dm-border-strong)] hover:bg-dm-surface/80 hover:text-dm-text",
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
