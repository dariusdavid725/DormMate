import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "DormMate — Shared costs, quieter chats",
    template: "%s · DormMate",
  },
  description:
    "Household receipts and balances tuned for shared flats — readable on the phone between classes.",
};

export default async function Home() {
  let userLoggedIn = false;
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userLoggedIn = !!user;
  } catch {
    userLoggedIn = false;
  }

  return (
    <div className="flex flex-1 flex-col">
      <section className="relative">
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:grid lg:grid-cols-[1fr,0.92fr] lg:items-center lg:gap-14 lg:py-28">
          <div>
            <p className="text-xs font-medium tracking-wide text-dm-muted">
              Housemates · Receipts · Clarity
            </p>
            <h1 className="mt-5 max-w-[18ch] text-balance text-[2.65rem] font-semibold leading-[1.05] tracking-tight text-dm-text sm:text-[3.35rem]">
              Money stays fair without the spreadsheet vibes.
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-dm-muted">
              Scan slips, surface what matters, and stop replaying „who bought
              what“ in your head — built for cramped kitchens and slim budgets.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              {userLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="rounded-full bg-[var(--dm-accent)] px-8 py-3.5 text-sm font-semibold text-[var(--dm-accent-ink)] shadow-lg shadow-black/10 transition hover:brightness-105 active:scale-[0.99]"
                >
                  Open Pulse
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="rounded-full bg-dm-electric px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-black/15 transition hover:brightness-110 active:scale-[0.99]"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-full border border-[var(--dm-border-strong)] bg-dm-surface/75 px-7 py-3.5 text-sm font-semibold text-dm-text backdrop-blur-sm transition hover:border-dm-electric/50 hover:bg-dm-surface"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-14 space-y-4 lg:mt-0">
            <figure className="rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/70 p-6 shadow-xl shadow-black/[0.04] backdrop-blur-md sm:p-8">
              <figcaption className="text-xs font-semibold text-dm-electric">
                Receipt intelligence
              </figcaption>
              <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
                Model reads totals and merchants so nobody re-keys smudgy paper tapes at midnight.
              </p>
            </figure>
            <figure className="rounded-3xl border border-[var(--dm-border)] bg-dm-surface/55 p-6 backdrop-blur-sm sm:p-8">
              <figcaption className="text-xs font-semibold text-dm-text">
                Night mode that doesn’t yell
              </figcaption>
              <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
                Deep navy when your OS prefers dark — less glare reviewing rent splits.
              </p>
            </figure>
          </div>
        </div>
      </section>
    </div>
  );
}
