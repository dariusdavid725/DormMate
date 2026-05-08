import type { ReactNode } from "react";

/**
 * On mobile, becomes the primary scroll region inside the fixed app shell.
 * On lg+, `contents` so pages keep normal document flow (desktop unchanged).
 */
export function MobileScrollViewport({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={[
        "min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain [-webkit-overflow-scrolling:touch]",
        "lg:contents lg:h-auto lg:overflow-visible",
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
