"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { signOut } from "@/lib/auth/actions";

type HouseholdOption = { id: string; name: string };

type Props = {
  email: string;
  displayName?: string | null;
  avatarUrl?: string | null;
  showAdmin?: boolean;
  households: HouseholdOption[];
};

function initialsFromIdentity(email: string, displayName?: string | null) {
  const base = displayName?.trim() || email.split("@")[0] || "?";
  return base.slice(0, 2).toUpperCase();
}

export function MobileTopBar({
  email,
  displayName,
  avatarUrl,
  showAdmin,
  households,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();

  const initials = initialsFromIdentity(email, displayName);
  const profileLabel = displayName?.trim() || email;

  const current =
    households.find((h) => {
      const href = `/dashboard/household/${h.id}`;
      return pathname === href || pathname.startsWith(`${href}/`);
    }) ?? households[0];

  return (
    <header className="dm-topbar-shell sticky top-0 z-40 border-b border-[var(--dm-border-strong)] pt-[env(safe-area-inset-top)] shadow-[0_8px_18px_rgba(28,39,56,0.08)] backdrop-blur-md lg:hidden">
      <div className="flex min-h-[52px] items-center gap-2 px-3 pb-2 pt-1">
        <div className="min-w-0 flex-1">
          <p className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-[0.14em] text-dm-muted">
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand logo in public */}
            <img src="/logo.png" alt="" className="h-4 w-4 rounded object-cover" aria-hidden />
            Home
          </p>
          {households.length === 0 ? (
            <p className="truncate font-cozy-display text-[1.35rem] leading-tight text-dm-text">
              Welcome
            </p>
          ) : (
            <>
              <label className="sr-only" htmlFor="dm-mobile-top-household">
                Active household
              </label>
              <select
                id="dm-mobile-top-household"
                value={current?.id ?? ""}
                onChange={(e) => {
                  const id = e.target.value;
                  if (!id) return;
                  router.push(`/dashboard/household/${id}`);
                }}
              className="mt-0.5 max-w-full min-h-[48px] w-full touch-manipulation rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface px-3 py-2.5 text-[1.02rem] font-semibold leading-snug text-dm-text shadow-[0_6px_14px_rgba(28,39,56,0.07)] sm:text-[1.08rem]"
              >
                {households.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.name}
                  </option>
                ))}
              </select>
            </>
          )}
        </div>

        <details className="relative shrink-0">
          <summary className="touch-manipulation list-none [&::-webkit-details-marker]:hidden">
            {avatarUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- user avatars from Supabase storage
              <img
                src={avatarUrl}
                alt={profileLabel}
                className="h-11 w-11 rounded-xl border border-[var(--dm-border-strong)] object-cover shadow-[1px_2px_0_rgba(54,47,40,0.06)]"
              />
            ) : (
              <span className="flex h-11 w-11 cursor-pointer items-center justify-center rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface-mid text-[11px] font-bold uppercase tracking-wide text-dm-text shadow-[1px_2px_0_rgba(54,47,40,0.06)]">
                {initials}
              </span>
            )}
            <span className="sr-only">Account menu</span>
          </summary>
          <div
            className="absolute right-0 mt-2 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface p-2 shadow-[0_14px_28px_rgba(28,39,56,0.16)]"
            role="menu"
          >
            <p className="truncate px-2 py-1 text-[11px] text-dm-muted" title={email}>
              {email}
            </p>
            <Link
              href="/dashboard/settings"
              prefetch
              className="touch-manipulation flex min-h-[44px] items-center rounded-lg px-2 text-[14px] font-medium text-dm-text hover:bg-dm-elevated/90"
              role="menuitem"
            >
              Settings
            </Link>
            <Link
              href="/dashboard/join"
              prefetch
              className="touch-manipulation flex min-h-[44px] items-center rounded-lg px-2 text-[14px] font-medium text-dm-text hover:bg-dm-elevated/90"
              role="menuitem"
            >
              Join home
            </Link>
            {showAdmin ? (
              <Link
                href="/dashboard/admin"
                prefetch
                className="touch-manipulation flex min-h-[44px] items-center rounded-lg px-2 text-[14px] font-semibold text-dm-electric hover:bg-dm-elevated/90"
                role="menuitem"
              >
                Site admin
              </Link>
            ) : null}
            <Link
              href="/dashboard/more"
              prefetch
              className="touch-manipulation flex min-h-[44px] items-center rounded-lg px-2 text-[14px] font-medium text-dm-muted hover:bg-dm-elevated/90"
              role="menuitem"
            >
              More & homes
            </Link>
            <form action={signOut} className="mt-1 border-t border-[var(--dm-border)] pt-1">
              <button
                type="submit"
                className="touch-manipulation flex min-h-[44px] w-full items-center rounded-lg px-2 text-left text-[14px] font-semibold text-dm-muted hover:bg-dm-elevated/90 hover:text-dm-text"
              >
                Sign out
              </button>
            </form>
          </div>
        </details>
      </div>
    </header>
  );
}
