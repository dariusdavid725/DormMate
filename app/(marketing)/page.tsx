import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { KotiMobileEntry } from "@/components/marketing/koti-mobile-entry";
import { PwaInstallDesktopHint } from "@/components/pwa/pwa-install-cta";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "Koti — The shared home board for roommates.",
    template: "%s · Koti",
  },
  description:
    "Koti is the shared home board for roommates — groceries, chores, receipts, expenses, and house updates in one place.",
};

export default async function Home() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (user) {
      redirect("/dashboard");
    }
  } catch {
    /* env missing offline — render marketing */
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <KotiMobileEntry />
      <div className="hidden flex-col lg:flex lg:flex-1">
        <section className="relative">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:grid lg:grid-cols-[1.05fr,0.92fr] lg:items-start lg:gap-16 lg:py-24">
            <div className="border-l-4 border-dm-electric pl-6 sm:pl-7">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-dm-muted">
                The shared home board for roommates
              </p>
              <h1 className="font-cozy-display mt-4 max-w-[18ch] text-balance text-[3.1rem] leading-[1.05] text-dm-text sm:text-[3.6rem]">
                Koti keeps shared living simple.
              </h1>
              <p className="mt-6 max-w-md text-[16px] leading-relaxed text-dm-muted">
                Groceries, chores, receipts, expenses, and house updates — all in one
                cozy board for roommates.
              </p>
              <div className="mt-10 flex flex-wrap items-center gap-3">
                <Link
                  href="/signup"
                  className="inline-flex rounded-md bg-dm-electric px-8 py-3 text-sm font-semibold text-white shadow-[var(--cozy-shadow-paper)] hover:brightness-105"
                >
                  Create your home
                </Link>
                <Link
                  href="/login"
                  className="inline-flex rounded-md border border-dashed border-[var(--dm-border-strong)] bg-dm-surface px-7 py-3 text-sm font-semibold text-dm-text hover:border-dm-electric"
                >
                  Log in
                </Link>
              </div>
              <PwaInstallDesktopHint />
            </div>

            <div className="mt-14 space-y-4 lg:mt-6">
              <figure className="cozy-note cozy-tilt-xs p-6 sm:p-7 shadow-[var(--cozy-shadow-note)]">
                <figcaption className="text-[11px] font-bold uppercase tracking-wide text-dm-muted">
                  Chores
                </figcaption>
                <p className="mt-3 text-[15px] leading-relaxed text-dm-muted">
                  Keep everyone aligned on what needs to be done, what is already done,
                  and what is next around the home.
                </p>
              </figure>
              <figure className="cozy-receipt cozy-tilt-xs-alt p-6 sm:p-7">
                <figcaption className="text-[11px] font-bold uppercase tracking-wide text-dm-muted">
                  Receipts
                </figcaption>
                <p className="mt-3 text-[15px] leading-relaxed text-dm-muted">
                  Scan receipts, track shared money, and keep split costs clear without
                  extra chat noise.
                </p>
              </figure>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
