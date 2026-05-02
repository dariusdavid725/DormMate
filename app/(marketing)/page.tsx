import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "DormMate — Roommate life without the spreadsheet dread",
    template: "%s · DormMate",
  },
  description:
    "Fair splits, groceries that actually get bought again, and chores that don’t blow up the group chat — made for students & renters sharing a roof.",
};

const features = [
  {
    title: "Money without shame spirals",
    body: "Know what’s shared vs yours — settle up without digging through three apps.",
    emoji: "🧾",
  },
  {
    title: "The pantry people remember",
    body: "Shared staples so TP and milk vanish less mysteriously.",
    emoji: "🥛",
  },
  {
    title: "Boundaries, kindly said",
    body: "Study mode & quiet windows — signal respect without passive‑aggressive sticky notes.",
    emoji: "🌙",
  },
];

const steps = [
  "Make an account with your uni or personal email.",
  "Spin up a household for your flat — invites land soon.",
  "Scan receipts and split fairly instead of doing receipt archaeology.",
];

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
      <section className="relative overflow-hidden px-4 pb-20 pt-14 sm:px-6 sm:pb-28 sm:pt-20">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_90%_70%_at_50%_-15%,rgba(45,212,191,0.22),transparent)] dark:bg-[radial-gradient(ellipse_90%_70%_at_50%_-15%,rgba(45,212,191,0.12),transparent)]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-amber-50/90 to-transparent dark:from-stone-950"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-teal-200/90 bg-white/90 px-4 py-1.5 text-xs font-semibold text-teal-900 shadow-sm backdrop-blur dark:border-teal-800/80 dark:bg-teal-950/40 dark:text-teal-100">
            Built for shared kitchens & thin walls · Honest beta
          </p>
          <h1 className="mt-8 text-balance text-4xl font-semibold tracking-tight text-stone-900 sm:text-5xl lg:text-[3.15rem] lg:leading-[1.12] dark:text-stone-50">
            Shared rent is enough drama — money doesn&apos;t have to be
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-stone-600 dark:text-stone-400">
            Research on student stress shows money ambiguity spikes anxiety and
            avoidance. DormMate keeps things visible and fair — starting with
            receipts you can snap, not spreadsheets you dread.
          </p>
          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {userLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:from-teal-500 hover:to-emerald-500 dark:shadow-black/40"
              >
                Go to your space
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex rounded-2xl bg-gradient-to-r from-teal-600 to-emerald-600 px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-teal-900/20 transition hover:from-teal-500 hover:to-emerald-500 dark:shadow-black/40"
                >
                  Start free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex rounded-2xl border border-stone-300 bg-white/90 px-8 py-3.5 text-sm font-semibold text-stone-900 backdrop-blur transition hover:bg-stone-50 dark:border-stone-600 dark:bg-stone-900/80 dark:text-stone-50 dark:hover:bg-stone-800"
                >
                  I already have an account
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-24 border-y border-stone-200/90 bg-gradient-to-b from-white to-amber-50/50 py-16 dark:border-stone-800 dark:from-stone-950 dark:to-stone-950"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
            Made for people who actually split a fridge
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-sm leading-relaxed text-stone-600 dark:text-stone-400">
            Co‑living works better when trust is easy — clear totals, shared
            rituals, and fewer “who ate my yoghurt?” mysteries.
          </p>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {features.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-stone-200/90 bg-white/95 p-7 shadow-sm ring-1 ring-stone-900/[0.03] dark:border-stone-800 dark:bg-stone-900/70 dark:ring-white/[0.04]"
              >
                <div className="text-3xl" aria-hidden>
                  {item.emoji}
                </div>
                <h3 className="mt-4 text-lg font-semibold text-stone-900 dark:text-stone-50">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:items-center lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-stone-900 dark:text-stone-50">
              Three calm steps
            </h2>
            <ol className="mt-10 space-y-6">
              {steps.map((text, idx) => (
                <li key={text} className="flex gap-4">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 text-sm font-bold text-white shadow-md shadow-teal-900/25 dark:shadow-black/40">
                    {idx + 1}
                  </span>
                  <p className="pt-2 text-sm leading-relaxed text-stone-600 dark:text-stone-400">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-14 rounded-3xl border border-dashed border-teal-300/70 bg-teal-50/60 p-10 text-center text-sm leading-relaxed text-teal-950 lg:mt-0 dark:border-teal-800/60 dark:bg-teal-950/30 dark:text-teal-100">
            Small households feel safer when tools sound human — not like HR for
            your flatmate.
          </div>
        </div>
      </section>

      <section className="border-t border-stone-200 bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-700 px-4 py-16 text-center dark:border-stone-800">
        <p className="text-lg font-semibold text-white drop-shadow-sm">
          Ready to lower the awkward thermostat?
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {userLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold text-teal-900 shadow-lg shadow-teal-950/30 transition hover:bg-stone-50"
            >
              Open workspace
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex rounded-2xl bg-white px-8 py-3.5 text-sm font-semibold text-teal-900 shadow-lg shadow-teal-950/30 transition hover:bg-stone-50"
            >
              Join DormMate
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
