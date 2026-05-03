import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "DormMate — Chores worth points · splits without drama",
    template: "%s · DormMate",
  },
  description:
    "Shared kitchens: post chores with rewards, scan receipts for fair money, groceries on deck — readable between classes.",
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
          <div className="dm-construct-accent pl-6 sm:pl-8">
            <p className="inline-flex skew-x-[-10deg] bg-[var(--dm-construct-yellow)] px-4 py-1 text-[11px] font-black uppercase tracking-[0.28em] text-black">
              Dorm ops
            </p>
            <h1 className="mt-6 max-w-[20ch] text-balance text-[2.65rem] font-extrabold leading-[1.05] tracking-tight text-dm-text sm:text-[3.35rem]">
              One room: chores earn rewards, receipts keep cash honest.
            </h1>
            <p className="mt-6 max-w-md text-[17px] leading-relaxed text-dm-muted">
              Post tasks for trash runs, resets, errands — mates claim them for fun
              points. Money tools stay tucked behind when you&apos;re settling who
              fronted Tesco.
            </p>
            <div className="mt-11 flex flex-wrap items-center gap-4">
              {userLoggedIn ? (
                <>
                  <Link
                    href="/dashboard/tasks"
                    className="dm-construct-angle inline-flex bg-[var(--dm-construct-red)] px-9 py-3.5 text-sm font-black uppercase tracking-[0.08em] text-white shadow-xl shadow-black/25 transition hover:brightness-105 active:scale-[0.99]"
                  >
                    Tasks & rewards
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex items-center border-b-2 border-[var(--dm-construct-ink)] pb-0.5 text-sm font-bold text-dm-text dark:border-white"
                  >
                    Dashboard
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="dm-construct-angle inline-flex bg-[var(--dm-construct-red)] px-8 py-3.5 text-sm font-black uppercase tracking-[0.06em] text-white shadow-xl shadow-black/25 transition hover:brightness-105 active:scale-[0.99]"
                  >
                    Get started
                  </Link>
                  <Link
                    href="/login"
                    className="rounded-sm border-[3px] border-[var(--dm-construct-ink)] bg-dm-electric px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition hover:brightness-110 dark:border-white"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          <div className="mt-14 space-y-4 lg:mt-0">
            <figure className="relative rotate-[0.75deg] overflow-hidden rounded-sm border-[3px] border-[var(--dm-construct-ink)] bg-[color-mix(in_srgb,var(--dm-construct-yellow)_18%,var(--dm-surface))] p-6 shadow-2xl dark:border-white/60 sm:p-8">
              <div
                aria-hidden
                className="absolute inset-y-8 right-0 w-24 translate-x-1/3 rotate-[-18deg] bg-[var(--dm-construct-red)] opacity-20"
              />
              <figcaption className="relative text-[11px] font-black uppercase tracking-[0.25em] text-[var(--dm-construct-ink)] dark:text-white">
                Chores on the wall
              </figcaption>
              <p className="relative mt-4 text-[15px] font-medium leading-relaxed text-[var(--dm-construct-ink)]/90 dark:text-dm-muted">
                Everyone sees the same list: who took the bins, who stocked milk, who
                owes a favour. Claim a task, earn the points you agreed on — no nagging
                DMs.
              </p>
            </figure>
            <figure className="-rotate-[0.5deg] rounded-3xl border border-[var(--dm-border-strong)] bg-dm-surface/75 p-6 shadow-xl shadow-black/[0.04] backdrop-blur-md sm:p-8">
              <figcaption className="text-xs font-bold text-dm-electric">
                Receipt intelligence
              </figcaption>
              <p className="mt-4 text-[15px] leading-relaxed text-dm-muted">
                AI lifts totals and merchants so nobody re-keys smudgy tapes at midnight.
              </p>
            </figure>
          </div>
        </div>
      </section>
    </div>
  );
}
