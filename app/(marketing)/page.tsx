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
          <div className="border-l-[3px] border-dm-electric pl-6 sm:pl-7">
            <p className="inline-flex rounded-full bg-[color-mix(in_srgb,var(--dm-fun)_18%,transparent)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-dm-text">
              For shared flats
            </p>
            <h1 className="mt-5 max-w-[20ch] text-balance text-[2.65rem] font-bold leading-[1.08] tracking-tight text-dm-text sm:text-[3.05rem]">
              One room: chores earn rewards, receipts keep cash honest.
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-dm-muted">
              No more infinite &ldquo;who took out the trash?&rdquo; or chasing who
              fronted Tesco. Track chores with points that your crew defines, stash
              receipts in one ledger, graduate to splits when math ships.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-3">
              {userLoggedIn ? (
                <>
                  <Link
                    href="/dashboard"
                    className="dm-scan-hero inline-flex rounded-xl bg-dm-electric px-8 py-3.5 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
                  >
                    Open dashboard
                  </Link>
                  <Link
                    href="/dashboard/tasks"
                    className="inline-flex rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/85 px-6 py-3.5 text-sm font-semibold text-dm-text backdrop-blur-sm transition hover:border-dm-electric/40"
                  >
                    Tasks & rewards
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="dm-scan-hero inline-flex rounded-xl bg-dm-electric px-8 py-3.5 text-sm font-bold text-white transition hover:brightness-110 active:scale-[0.99]"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface/85 px-7 py-3.5 text-sm font-semibold text-dm-text backdrop-blur-sm transition hover:border-dm-electric/45"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-14 space-y-4 lg:mt-6">
            <figure className="overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/82 p-6 shadow-xl shadow-black/[0.05] backdrop-blur-md sm:p-7">
              <figcaption className="text-xs font-semibold uppercase tracking-wider text-dm-electric">
                Chores you can claim
              </figcaption>
              <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
                One wall everyone sees: bins, errands, cleanup. Someone finishes —
                points land on them. Rewards are whatever your flat decides (coffee,
                vibe, bragging rights).
              </p>
            </figure>
            <figure className="overflow-hidden rounded-2xl border border-[var(--dm-border-strong)] bg-dm-surface/75 p-6 shadow-lg shadow-black/[0.04] backdrop-blur-md sm:p-7">
              <figcaption className="text-xs font-semibold uppercase tracking-wider text-dm-accent">
                Receipt intelligence
              </figcaption>
              <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
                Snap slips after the shop trip. AI pulls totals — no blurry midnight
                retyping — so money talk stays sane.
              </p>
            </figure>
          </div>
        </div>
      </section>
    </div>
  );
}
