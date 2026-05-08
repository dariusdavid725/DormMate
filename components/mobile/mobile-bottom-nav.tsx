"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: string;
};

const NAV: readonly Item[] = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/dashboard/tasks", label: "Chores", icon: "✓" },
  { href: "/dashboard/finances", label: "Money", icon: "$" },
  { href: "/dashboard/inventory", label: "Groceries", icon: "◧" },
  { href: "/dashboard/more", label: "More", icon: "…" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return pathname === "/dashboard" || pathname.startsWith("/dashboard/household");
  }
  if (href === "/dashboard/more") {
    return (
      pathname === "/dashboard/more" ||
      pathname === "/dashboard/activity" ||
      pathname.startsWith("/dashboard/settings") ||
      pathname.startsWith("/dashboard/admin") ||
      pathname === "/dashboard/join"
    );
  }
  if (href === "/dashboard/tasks") {
    return pathname === "/dashboard/tasks";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--dm-border-strong)] bg-dm-surface/[0.98] px-1 pb-[max(0.55rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_24px_rgba(28,39,56,0.1)] backdrop-blur-md lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-x-0.5 gap-y-1 px-1">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="min-w-0">
              <Link
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={[
                  "touch-manipulation flex min-h-[54px] flex-col items-center justify-center rounded-xl px-0.5 py-1.5 text-center text-[12px] font-semibold leading-[1.15] tracking-tight transition-[transform,colors,box-shadow] active:scale-[0.97]",
                  active
                    ? "bg-[color-mix(in_srgb,var(--dm-electric)_15%,#fff)] text-[var(--dm-electric-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.45),0_8px_16px_rgba(28,39,56,0.12)]"
                    : "text-dm-muted hover:bg-dm-elevated/85 hover:text-dm-text",
                ].join(" ")}
              >
                <span className="text-[11px] leading-none opacity-85" aria-hidden>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
