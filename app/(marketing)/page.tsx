import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "DormMate — Shared household finance",
    template: "%s · DormMate",
  },
  description:
    "Receipts, splits, and household basics in one calm workspace — built for roommates and shared flats.",
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
      <section className="relative min-h-[calc(100vh-8rem)] lg:min-h-[calc(100vh-5rem)]">
        <div className="mx-auto grid max-w-7xl gap-0 lg:min-h-[calc(100vh-8rem)] lg:grid-cols-2 lg:gap-0">
          {/* Editorial column — subtle tone block */}
          <div className="flex flex-col justify-center border-b border-stone-200/80 bg-[#ebe9e4] px-6 py-16 sm:px-10 lg:border-b-0 lg:border-r lg:py-24 lg:pl-12 lg:pr-10 xl:pl-16">
            <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-stone-500">
              Shared housing
            </p>
            <h1 className="mt-6 max-w-lg text-pretty text-4xl font-semibold tracking-tight text-stone-950 sm:text-5xl sm:leading-[1.08]">
              One workspace for costs you split together.
            </h1>
            <p className="mt-6 max-w-md text-[15px] leading-relaxed text-stone-600">
              Scan receipts, track what matters, and keep conversations factual
              instead of tense—without turning your flat into a spreadsheet.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              {userLoggedIn ? (
                <Link
                  href="/dashboard"
                  className="inline-flex rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                >
                  Open workspace
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="inline-flex rounded-lg bg-teal-700 px-6 py-2.5 text-sm font-medium text-white transition hover:bg-teal-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-700"
                  >
                    Create account
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex rounded-lg border border-stone-300 bg-white/90 px-6 py-2.5 text-sm font-medium text-stone-900 transition hover:bg-white"
                  >
                    Log in
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Quiet preview — structural, not decorative */}
          <div className="flex flex-col justify-center px-6 py-14 sm:px-10 lg:py-24 lg:pr-12 xl:pr-16">
            <div className="mx-auto w-full max-w-md">
              <div className="rounded-xl border border-stone-200 bg-white p-6 shadow-[0_1px_0_0_rgba(0,0,0,0.04)]">
                <div className="flex items-baseline justify-between gap-4 border-b border-stone-100 pb-4">
                  <span className="text-xs font-medium uppercase tracking-wider text-stone-400">
                    Household
                  </span>
                  <span className="font-mono text-sm tabular-nums text-stone-900">
                    —
                  </span>
                </div>
                <dl className="mt-5 space-y-4 font-mono text-sm tabular-nums">
                  <div className="flex justify-between gap-6 text-stone-600">
                    <dt className="font-sans text-[13px] font-normal text-stone-500">
                      Receipt scan
                    </dt>
                    <dd className="text-stone-900">Ready</dd>
                  </div>
                  <div className="flex justify-between gap-6 text-stone-600">
                    <dt className="font-sans text-[13px] font-normal text-stone-500">
                      Shared staples
                    </dt>
                    <dd className="text-stone-900">—</dd>
                  </div>
                  <div className="flex justify-between gap-6 text-stone-600">
                    <dt className="font-sans text-[13px] font-normal text-stone-500">
                      Members
                    </dt>
                    <dd className="text-stone-900">—</dd>
                  </div>
                </dl>
              </div>
              <p className="mt-8 text-center text-xs leading-relaxed text-stone-500">
                Receipts · groceries · chores — one place, minimal noise.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
