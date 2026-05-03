import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div className="pointer-events-none absolute inset-x-4 top-[12%] h-44 max-w-2xl rounded-sm border border-dashed border-[var(--dm-border-strong)]/55 bg-dm-surface/40 blur-[1px]" />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
