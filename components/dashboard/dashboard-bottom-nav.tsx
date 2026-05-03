"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
};

const NAV: readonly Item[] = [
  { href: "/dashboard", label: "Home" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/finances", label: "Money" },
  { href: "/dashboard/inventory", label: "Food" },
  { href: "/dashboard/settings", label: "You" },
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--dm-border-strong)] bg-dm-surface px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-1.5 lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-0.5 text-[11px]">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                className={[
                  "block rounded-md py-2 text-center font-medium transition-colors",
                  active ? "text-dm-electric" : "text-dm-muted hover:text-dm-text",
                ].join(" ")}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
