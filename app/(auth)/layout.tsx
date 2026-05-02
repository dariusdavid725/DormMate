export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center px-4 py-16">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_85%_55%_at_50%_-25%,rgba(251,191,36,0.18),transparent)] dark:bg-[radial-gradient(ellipse_85%_55%_at_50%_-25%,rgba(45,212,191,0.12),transparent)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_80%_90%,rgba(45,212,191,0.12),transparent)] dark:bg-[radial-gradient(ellipse_70%_60%_at_80%_90%,rgba(251,191,36,0.06),transparent)]"
      />
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
