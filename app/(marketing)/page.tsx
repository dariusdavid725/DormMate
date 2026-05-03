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
            <p className="text-[11px] font-medium uppercase tracking-wide text-dm-muted">
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
                    className="inline-flex rounded-md bg-dm-electric px-8 py-3 text-sm font-medium text-[var(--dm-accent-ink)] hover:brightness-105"
                  >
                    Open dashboard
                  </Link>
                  <Link
                    href="/dashboard/tasks"
                    className="inline-flex rounded-md border border-[var(--dm-border-strong)] px-6 py-3 text-sm font-medium text-dm-text hover:border-dm-electric"
                  >
                    Tasks
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex rounded-md bg-dm-electric px-8 py-3 text-sm font-medium text-[var(--dm-accent-ink)] hover:brightness-105"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex rounded-md border border-[var(--dm-border-strong)] px-7 py-3 text-sm font-medium text-dm-text hover:border-dm-electric"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-14 space-y-4 lg:mt-6">
            <figure className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-6 sm:p-7">
              <figcaption className="text-[11px] font-medium uppercase tracking-wide text-dm-muted">
                Chores you can claim
              </figcaption>
              <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
                One wall everyone sees: bins, errands, cleanup. Someone finishes —
                points land on them. Rewards are whatever your flat decides (coffee,
                vibe, bragging rights).
              </p>
            </figure>
            <figure className="rounded-lg border border-[var(--dm-border-strong)] bg-dm-surface p-6 sm:p-7">
              <figcaption className="text-[11px] font-medium uppercase tracking-wide text-dm-muted">
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
