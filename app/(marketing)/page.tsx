import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "DormMate — chores, receipts & roommate money",
    template: "%s · DormMate",
  },
  description:
    "Keep chores fun, receipts clear, and who-owes-who quieter — built for flats and dorm rooms.",
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
        <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:grid lg:grid-cols-[1.05fr,0.92fr] lg:items-start lg:gap-16 lg:py-24">
          <div className="border-l-4 border-dm-electric pl-6 sm:pl-7">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
              Shared flats & dorms
            </p>
            <h1 className="font-cozy-display mt-4 max-w-[18ch] text-balance text-[3.1rem] leading-[1.05] text-dm-text sm:text-[3.6rem]">
              The household corkboard.
            </h1>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed text-dm-muted">
              Stick chores with points, clip receipts in one strip, and keep money talk
              off the endless group chat.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {userLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="inline-flex rounded-md bg-dm-electric px-8 py-3 text-sm font-semibold text-white shadow-[var(--cozy-shadow-paper)] hover:brightness-105"
                  >
                    Open board
                  </Link>
                  <Link
                    href="/dashboard/tasks"
                    className="cozy-note cozy-hover-wiggle inline-flex rounded-[2px] px-6 py-3 text-sm font-semibold text-dm-text shadow-[var(--cozy-shadow-note)]"
                  >
                    Task stickies
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex rounded-md bg-dm-electric px-8 py-3 text-sm font-semibold text-white shadow-[var(--cozy-shadow-paper)] hover:brightness-105"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface px-7 py-3 text-sm font-semibold text-dm-text hover:border-dm-electric"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-14 space-y-4 lg:mt-6">
            <figure className="cozy-note cozy-tilt-xs p-6 sm:p-7 shadow-[var(--cozy-shadow-note)]">
              <figcaption className="text-[11px] font-bold uppercase tracking-wide text-dm-muted">
                Chores
              </figcaption>
              <p className="mt-3 text-[15px] leading-relaxed text-dm-muted">
                Yellow notes for what needs doing — claim one, earn the points your flat
                dreams up.
              </p>
            </figure>
            <figure className="cozy-receipt cozy-tilt-xs-alt p-6 sm:p-7">
              <figcaption className="text-[11px] font-bold uppercase tracking-wide text-dm-muted">
                Receipts
              </figcaption>
              <p className="mt-3 text-[15px] leading-relaxed text-dm-muted">
                Snap the crumpled till tape. We read the total so nobody retypes with
                cold thumbs.
              </p>
            </figure>
          </div>
        </div>
      </section>
    </div>
  );
}
