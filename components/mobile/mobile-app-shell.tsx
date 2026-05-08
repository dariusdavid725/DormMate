import type { ReactNode } from "react";

/**
 * Wraps dashboard page content on small screens only.
 * On lg+, acts as a transparent pass-through (`lg:contents`) so desktop layout is unchanged.
 */
export function MobileAppShell({ children }: { children: ReactNode }) {
  return (
    <div className="dm-mobile-app-shell flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden max-lg:bg-[linear-gradient(180deg,#f4f6fa_0%,#eaeef6_52%,#f0f3f8_100%)] lg:contents lg:min-w-0 lg:overflow-visible lg:bg-transparent">
      {children}
    </div>
  );
}
