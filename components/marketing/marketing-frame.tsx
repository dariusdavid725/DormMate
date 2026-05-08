"use client";

import type { ReactNode } from "react";

import { usePathname } from "next/navigation";

/**
 * Hides SiteHeader/SiteFooter on mobile for "/" only so the homepage can render a full-viewport app entry.
 * Desktop unchanged.
 */
export function MarketingFrame({
  header,
  footer,
  children,
}: {
  header: ReactNode;
  footer: ReactNode;
  children: ReactNode;
}) {
  const pathname = usePathname();
  const hideChromeOnMobileHome = pathname === "/";

  return (
    <>
      <div className={hideChromeOnMobileHome ? "hidden lg:block" : "block"}>{header}</div>
      <main
        className={
          hideChromeOnMobileHome ?
            "relative flex min-h-0 flex-1 flex-col lg:flex-1"
          : "flex flex-1 flex-col"
        }
      >
        {children}
      </main>
      <div className={hideChromeOnMobileHome ? "hidden lg:block" : "block"}>{footer}</div>
    </>
  );
}
