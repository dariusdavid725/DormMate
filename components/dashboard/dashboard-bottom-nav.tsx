"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
};

const NAV: readonly Item[] = [
  { href: "/dashboard", label: "Board" },
  { href: "/dashboard/tasks", label: "Tasks" },
  { href: "/dashboard/finances", label: "$" },
  { href: "/dashboard/inventory", label: "Pantry" },
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
      className="fixed bottom-0 left-0 right-0 z-50 border-t border-dashed border-[var(--dm-border-strong)] bg-dm-surface/96 px-1 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgba(54,47,40,0.08)] backdrop-blur-sm lg:hidden"
    >
      <ul className="mx-auto grid max-w-lg grid-cols-5 gap-1 text-[11px]">
        {NAV.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                prefetch
                aria-current={active ? "page" : undefined}
                className={[
                  "flex min-h-12 flex-col items-center justify-center rounded-md px-1 py-1.5 font-semibold transition-colors active:scale-[0.98]",
                  active
                    ? "bg-[rgba(247,236,184,0.55)] text-[var(--dm-electric-deep)]"
                    : "text-dm-muted hover:bg-dm-elevated/80 hover:text-dm-text",
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
