import type { ReactNode } from "react";

export default function AuthLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-dm-bg px-4 py-16">
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
