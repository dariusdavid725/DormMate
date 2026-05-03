import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-[var(--dm-border-strong)] bg-dm-surface/65 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-10 text-sm text-dm-muted sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} DormMate</p>
        <div className="flex gap-8 font-medium">
          <Link href="/privacy" className="hover:text-dm-electric">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-dm-electric">
            Terms
          </Link>
        </div>
      </div>
    </footer>
  );
}
