import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t-[3px] border-dm-electric bg-dm-bg">
      <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-10 font-mono text-[10px] font-bold uppercase tracking-widest text-dm-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p className="text-dm-muted">© {new Date().getFullYear()} DormMate OS</p>
        <div className="flex flex-wrap gap-x-8 gap-y-3">
          <Link href="/privacy" className="text-dm-electric hover:underline">
            Privacy
          </Link>
          <Link href="/terms" className="text-dm-electric hover:underline">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
