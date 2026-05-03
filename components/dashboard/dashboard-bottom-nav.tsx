"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: string;
};

const NAV: readonly Item[] = [
  { href: "/dashboard", label: "Home", icon: "🏠" },
  { href: "/dashboard/finances", label: "Finance", icon: "📊" },
  { href: "/dashboard/inventory", label: "Groceries", icon: "🛒" },
  { href: "/dashboard/settings", label: "You", icon: "⚙️" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/household")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function DashboardBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile primary"
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--dm-border-strong)] bg-dm-surface/92 px-4 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_32px_-8px_var(--dm-electric-glow)] backdrop-blur-xl lg:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-4 gap-1">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                className={[
                  "flex flex-col items-center gap-1 rounded-2xl py-2.5 text-[11px] font-medium transition active:scale-[0.97]",
                  active
                    ? "bg-[color-mix(in_srgb,var(--dm-electric)_14%,transparent)] text-dm-electric"
                    : "text-dm-muted hover:text-dm-text",
                ].join(" ")}
              >
                <span className="text-xl leading-none" aria-hidden>
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
