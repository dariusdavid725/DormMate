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
  { href: "/dashboard/finances", label: "Finances", icon: "📊" },
  { href: "/dashboard/inventory", label: "Grocery", icon: "🛒" },
  { href: "/dashboard/settings", label: "Settings", icon: "⚙️" },
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t-[3px] border-dm-electric bg-dm-surface/95 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur-md lg:hidden"
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
                  "flex flex-col items-center gap-1 rounded-md py-2 text-[10px] font-semibold uppercase tracking-wide transition",
                  active
                    ? "bg-dm-electric text-white shadow-[3px_3px_0_0_var(--dm-border-strong)]"
                    : "text-dm-muted hover:bg-dm-elevated hover:text-dm-text",
                ].join(" ")}
              >
                <span className="text-lg leading-none" aria-hidden>
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
