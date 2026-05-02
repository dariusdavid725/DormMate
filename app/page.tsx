import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "DormMate — Co-living for roommates who hate spreadsheets",
    template: "%s · DormMate",
  },
  description:
    "Split bills fairly, chore balance, groceries, and focus time — shared living OS for students and young renters.",
};

const features = [
  {
    title: "Fair money splits",
    body: "Receipts, shared vs personal buys, settle-up without WhatsApp archaeology.",
    icon: "◎",
  },
  {
    title: "Groceries that don’t spiral",
    body: "Shared lists and low-stock cues so TP and milk disappear less mysteriously.",
    icon: "◆",
  },
  {
    title: "Quiet hours, respectfully",
    body: "Signals for studying and sleep so interruptions become opt-in.",
    icon: "☾",
  },
];

const steps = [
  "Sign up once with your uni or personal email.",
  "Create your household — or join via invite.",
  "Add expenses, chores, and grocery staples as you actually live.",
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
      <section className="relative overflow-hidden px-4 py-16 sm:px-6 sm:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 -top-32 h-[28rem] bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(16,185,129,0.18),transparent)] dark:bg-[radial-gradient(ellipse_70%_60%_at_50%_0%,rgba(16,185,129,0.1),transparent)]"
        />
        <div className="relative mx-auto max-w-3xl text-center">
          <p className="inline-flex rounded-full border border-emerald-200/80 bg-emerald-50/80 px-3 py-1 text-xs font-medium text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-100">
            Shared flats & dorms • Private beta quality
          </p>
          <h1 className="mt-6 text-balance text-4xl font-semibold tracking-tight text-zinc-950 sm:text-5xl lg:text-[3.35rem] dark:text-white">
            Co-living that stays organized without becoming a second job
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-pretty text-lg text-zinc-600 dark:text-zinc-400">
            DormMate is the lightweight operating system for roommates — money,
            pantry, chores, and headspace — with AI-ready hooks as we mature.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            {userLoggedIn ? (
              <Link
                href="/dashboard"
                className="inline-flex rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
              >
                Go to dashboard
              </Link>
            ) : (
              <>
                <Link
                  href="/signup"
                  className="inline-flex rounded-lg bg-emerald-600 px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-700"
                >
                  Start free account
                </Link>
                <Link
                  href="/login"
                  className="inline-flex rounded-lg border border-zinc-300 px-6 py-3 text-sm font-semibold text-zinc-900 transition hover:bg-zinc-50 dark:border-zinc-600 dark:text-white dark:hover:bg-zinc-800"
                >
                  Log in
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      <section
        id="features"
        className="scroll-mt-24 border-y border-zinc-200 bg-zinc-50/80 py-16 dark:border-zinc-800 dark:bg-zinc-950/60"
      >
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Designed for noisy group chats & tight budgets
          </h2>
          <div className="mt-14 grid gap-6 sm:grid-cols-3">
            {features.map((item) => (
              <article
                key={item.title}
                className="rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm dark:border-zinc-800 dark:bg-zinc-900"
              >
                <div className="text-2xl text-emerald-600 dark:text-emerald-400">{item.icon}</div>
                <h3 className="mt-4 text-lg font-medium text-zinc-900 dark:text-white">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-zinc-600 dark:text-zinc-400">
                  {item.body}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="how-it-works" className="scroll-mt-24 px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl lg:grid lg:grid-cols-2 lg:gap-16 lg:items-center">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight text-zinc-900 dark:text-white">
              How groups get started
            </h2>
            <ol className="mt-10 space-y-6">
              {steps.map((text, idx) => (
                <li key={text} className="flex gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-semibold text-emerald-900 dark:bg-emerald-950 dark:text-emerald-200">
                    {idx + 1}
                  </span>
                  <p className="text-sm leading-relaxed text-zinc-600 pt-2 dark:text-zinc-400">
                    {text}
                  </p>
                </li>
              ))}
            </ol>
          </div>
          <div className="mt-14 rounded-2xl border border-dashed border-zinc-300 p-10 text-center text-sm text-zinc-500 lg:mt-0 dark:border-zinc-700 dark:text-zinc-400">
            Household creation and invites ship next — you already have accounts and a
            protected dashboard scaffold.
          </div>
        </div>
      </section>

      <section className="border-t border-zinc-200 bg-emerald-600 px-4 py-16 text-center dark:border-zinc-800">
        <p className="text-lg font-medium text-white">
          Ready to calm the roommate chaos?
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {userLoggedIn ? (
            <Link
              href="/dashboard"
              className="inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-zinc-100"
            >
              Open dashboard
            </Link>
          ) : (
            <Link
              href="/signup"
              className="inline-flex rounded-lg bg-white px-6 py-3 text-sm font-semibold text-emerald-900 transition hover:bg-zinc-100"
            >
              Join DormMate
            </Link>
          )}
        </div>
      </section>
    </div>
  );
}
