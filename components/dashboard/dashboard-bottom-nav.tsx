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
  { href: "/dashboard/tasks", label: "Tasks", icon: "✓" },
  { href: "/dashboard/finances", label: "Money", icon: "📊" },
  { href: "/dashboard/inventory", label: "Food", icon: "🛒" },
  { href: "/dashboard/settings", label: "You", icon: "⚙️" },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/dashboard") {
    return (
      pathname === "/dashboard" ||
      pathname.startsWith("/dashboard/household")
    );
  }
  if (href === "/dashboard/tasks") {
    return pathname === "/dashboard/tasks";
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
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 px-0.5">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                className={[
                  "flex flex-col items-center gap-0.5 rounded-2xl py-2 text-[10px] font-semibold leading-tight transition active:scale-[0.97]",
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
