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
    <header className="z-40 shrink-0 lg:hidden">
      <div className="border-b border-[color-mix(in_srgb,var(--dm-border-strong)_85%,transparent)] bg-[color-mix(in_srgb,var(--dm-surface)_92%,transparent)] pt-[env(safe-area-inset-top)] shadow-[0_10px_24px_rgba(28,39,56,0.06)] backdrop-blur-lg supports-[backdrop-filter]:bg-[color-mix(in_srgb,var(--dm-surface)_86%,transparent)]">
        <div className="mx-auto flex h-[56px] max-w-lg items-center gap-2 px-3 sm:h-[60px] sm:gap-3 sm:px-4">
          <Link
            href="/dashboard"
            prefetch
            className="touch-manipulation flex shrink-0 items-center gap-2 rounded-xl py-2 pr-2 active:bg-dm-elevated/80"
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- static brand */}
            <img src="/logo.png" alt="" className="h-8 w-8 rounded-lg object-cover shadow-sm" width={32} height={32} />
            <span className="hidden max-w-[5.5rem] truncate text-[13px] font-bold leading-tight text-dm-text min-[380px]:inline">
              Koti
            </span>
          </Link>

          <div className="min-w-0 flex-1 flex justify-center px-1">
            {households.length === 0 ? (
              <span className="rounded-full border border-dashed border-[var(--dm-border-strong)] px-3 py-1.5 text-[12px] font-semibold text-dm-muted">
                No home yet
              </span>
            ) : (
              <div className="relative w-full max-w-[200px] sm:max-w-[240px]">
                <label className="sr-only" htmlFor="dm-mobile-top-household">
                  Household
                </label>
                <select
                  id="dm-mobile-top-household"
                  value={current?.id ?? ""}
                  onChange={(e) => {
                    const id = e.target.value;
                    if (!id) return;
                    router.push(`/dashboard/household/${id}`);
                  }}
                  className="dm-focus-ring w-full min-h-[44px] cursor-pointer appearance-none rounded-full border border-[color-mix(in_srgb,var(--dm-social)_22%,var(--dm-border-strong))] bg-[linear-gradient(180deg,#fffefb_0%,#f4f5fa_100%)] py-2.5 pl-3.5 pr-9 text-[13px] font-semibold text-dm-text shadow-[0_4px_12px_rgba(28,39,56,0.07),inset_0_1px_0_rgba(255,255,255,0.75)]"
                >
                  {households.map((h) => (
                    <option key={h.id} value={h.id}>
                      {h.name}
                    </option>
                  ))}
                </select>
                <span
                  className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-dm-muted"
                  aria-hidden
                >
                  ▼
                </span>
              </div>
            )}
          </div>

          <details className="relative shrink-0">
            <summary className="touch-manipulation list-none [&::-webkit-details-marker]:hidden">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element -- storage avatars
                <img
                  src={avatarUrl}
                  alt={profileLabel}
                  className="h-11 w-11 rounded-2xl border border-[var(--dm-border-strong)] object-cover shadow-sm active:scale-[0.97]"
                />
              ) : (
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface-mid text-[11px] font-bold uppercase tracking-wide text-dm-text shadow-sm active:scale-[0.97]">
                  {initials}
                </span>
              )}
              <span className="sr-only">Account</span>
            </summary>
            <div
              className="absolute right-0 mt-2 w-[min(18rem,calc(100vw-1.5rem))] overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface p-2 shadow-[0_16px_40px_rgba(28,39,56,0.18)]"
              role="menu"
            >
              <p className="truncate px-2 py-1.5 text-[11px] text-dm-muted" title={email}>
                {email}
              </p>
              <Link
                href="/dashboard/settings"
                prefetch
                className="flex min-h-[48px] items-center rounded-xl px-3 text-[15px] font-medium text-dm-text active:bg-dm-elevated/90"
                role="menuitem"
              >
                Profile & settings
              </Link>
              <Link
                href="/dashboard/join"
                prefetch
                className="flex min-h-[48px] items-center rounded-xl px-3 text-[15px] font-medium text-dm-text active:bg-dm-elevated/90"
                role="menuitem"
              >
                Join home
              </Link>
              {showAdmin ? (
                <Link
                  href="/dashboard/admin"
                  prefetch
                  className="flex min-h-[48px] items-center rounded-xl px-3 text-[15px] font-semibold text-dm-electric active:bg-dm-elevated/90"
                  role="menuitem"
                >
                  Site admin
                </Link>
              ) : null}
              <form action={signOut} className="mt-1 border-t border-[var(--dm-border)] pt-1">
                <button
                  type="submit"
                  className="flex min-h-[48px] w-full items-center rounded-xl px-3 text-left text-[15px] font-semibold text-dm-muted active:bg-dm-elevated/90 active:text-dm-text"
                >
                  Sign out
                </button>
              </form>
            </div>
          </details>
        </div>
      </div>
    </header>
  );
}
