import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-dm-bg px-4 py-14 lg:py-16">
      <div className="pointer-events-none absolute inset-0 overflow-hidden opacity-45">
        <div className="absolute -left-[12%] top-[-20%] h-[22rem] w-[22rem] rounded-full blur-3xl [background:radial-gradient(circle_at_center,color-mix(in_srgb,var(--dm-electric)_32%,transparent),transparent)]" />
        <div className="absolute bottom-[-10%] right-[-15%] h-[18rem] w-[24rem] rounded-full blur-3xl [background:radial-gradient(circle_at_center,color-mix(in_srgb,var(--dm-accent)_24%,transparent),transparent)]" />
      </div>
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
