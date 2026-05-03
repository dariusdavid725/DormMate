export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="relative flex flex-1 flex-col items-center justify-center bg-[#fafafa] px-4 py-16 dark:bg-stone-950">
      <div className="relative w-full max-w-md">{children}</div>
    </div>
  );
}
