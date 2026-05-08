import type { ReactNode } from "react";

/**
 * Wraps dashboard page content on small screens only.
 * On lg+, acts as a transparent pass-through (`lg:contents`) so desktop layout is unchanged.
 */
export function MobileAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="dm-mobile-app-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-x-hidden max-lg:bg-[linear-gradient(180deg,#f6f7fb_0%,#eef1f6_50%,#f2f4f7_100%)] lg:contents lg:min-w-0 lg:overflow-visible lg:bg-transparent">
      {children}
    </div>
  );
}
