"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type Item = {
  href: string;
  label: string;
  icon: string;
};

/** Native-style primary nav: matches spec order (tablet/desktop hidden via lg:hidden on nav). */
const NAV: readonly Item[] = [
  { href: "/dashboard", label: "Home", icon: "⌂" },
  { href: "/dashboard/inventory", label: "Groceries", icon: "◧" },
  { href: "/dashboard/tasks", label: "Chores", icon: "✓" },
  { href: "/dashboard/finances", label: "Money", icon: "$" },
  { href: "/dashboard/more", label: "More", icon: "…" },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === "/dashboard") {
    return pathname === "/dashboard";
  }
  if (href === "/dashboard/more") {
    return (
      pathname === "/dashboard/more"
      || pathname === "/dashboard/activity"
      || pathname.startsWith("/dashboard/settings")
      || pathname.startsWith("/dashboard/admin")
      || pathname === "/dashboard/join"
      || pathname.startsWith("/dashboard/household/")
    );
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Primary"
      className="relative z-40 shrink-0 lg:hidden"
    >
      <div className="pointer-events-none absolute inset-x-0 bottom-0 top-[-1px] bg-gradient-to-t from-black/[0.04] to-transparent" aria-hidden />
      <div className="border-t border-[color-mix(in_srgb,var(--dm-border-strong)_90%,transparent)] bg-[color-mix(in_srgb,var(--dm-surface)_94%,transparent)] px-2 pb-[max(0.6rem,env(safe-area-inset-bottom))] pt-1.5 shadow-[0_-12px_32px_rgba(28,39,56,0.12)] backdrop-blur-xl supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--dm-surface)_88%,transparent)]">
        <ul className="mx-auto grid max-w-md grid-cols-5 gap-0.5">
          {NAV.map((item) => {
            const active = isActive(pathname, item.href);
            return (
              <li key={item.href} className="min-w-0">
                <Link
                  href={item.href}
                  prefetch
                  aria-current={active ? "page" : undefined}
                  className={[
                    "dm-mobile-nav-item touch-manipulation flex min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl px-1 py-1.5 text-center text-[10px] font-bold uppercase tracking-[0.06em] motion-reduce:transition-none transition-[transform,box-shadow,background-color,color] duration-200 motion-reduce:active:scale-100 active:scale-[0.96]",
                    active
                      ? "bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dm-electric)_18%,#fff)_0%,color-mix(in_srgb,var(--dm-social)_10%,#fff)_100%)] text-[var(--dm-electric-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.55),0_8px_18px_rgba(126,106,209,0.12)]"
                      : "text-dm-muted active:bg-dm-elevated/80",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "text-[15px] leading-none transition-transform duration-200",
                      active ? "scale-110" : "opacity-80",
                    ].join(" ")}
                    aria-hidden
                  >
                    {item.icon}
                  </span>
                  <span className="max-w-full truncate normal-case tracking-tight">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
