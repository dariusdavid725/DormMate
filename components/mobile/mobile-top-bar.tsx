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
    <header className="sticky top-0 z-40 border-b border-[var(--dm-border-strong)] bg-dm-surface/94 pt-[env(safe-area-inset-top)] shadow-[var(--cozy-shadow-paper)] backdrop-blur-md lg:hidden">
      <div className="flex min-h-[52px] items-center gap-2 px-3 pb-2 pt-1">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-dm-muted">
            Household
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
              className="mt-0.5 max-w-full min-h-[48px] w-full touch-manipulation rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface px-3 py-2.5 font-cozy-display text-[1.15rem] leading-snug text-dm-text max-[380px]:text-[1.05rem] sm:text-[1.35rem]"
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
            className="absolute right-0 mt-2 w-[min(17rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface p-2 shadow-[var(--cozy-shadow-paper)]"
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
              Join household
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
              More & households
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
