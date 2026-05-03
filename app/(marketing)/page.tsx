import type { Metadata } from "next";
import Link from "next/link";

import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: {
    default: "DormMate · Dorm finance OS",
    template: "%s · DormMate",
  },
  description:
    "Mobile-first roommate ledger — receipts, AI scan lane, submarine dark mode.",
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
      <section className="relative border-b-[3px] border-dm-electric">
        <div className="mx-auto grid max-w-7xl gap-0 lg:min-h-[min(640px,calc(100vh-10rem))] lg:grid-cols-[1fr,44%]">
          <div className="relative flex flex-col justify-center overflow-hidden px-6 py-16 sm:px-12 lg:border-r-[3px] lg:border-dm-electric lg:py-24">
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `linear-gradient(135deg, var(--dm-electric) 12px, transparent 12px)`,
                backgroundSize: "24px 24px",
              }}
            />
            <div className="relative border-[3px] border-dm-border-strong bg-dm-surface p-8 shadow-[8px_8px_0_0_var(--dm-electric)] sm:p-12">
              <p className="font-mono text-[10px] font-black uppercase tracking-[0.3em] text-dm-muted">
                Clean brutal · Receipt AI
              </p>
              <h1 className="mt-6 max-w-lg text-pretty font-sans text-4xl font-black uppercase leading-[0.95] tracking-tighter text-dm-text sm:text-5xl">
                Electricity for shared money.
              </h1>
              <p className="mt-8 max-w-md text-[15px] font-medium leading-relaxed text-dm-muted">
                Neon mint hits when you nail a split. Navy holds your night-shift
                focus. Receipt scan is the gravitational center — everything else orbits clarity.
              </p>
              <div className="mt-12 flex flex-wrap gap-4">
                {userLoggedIn ? (
                  <Link
                    href="/dashboard"
                    className="rounded-none border-[3px] border-dm-accent bg-dm-accent px-8 py-3.5 font-mono text-[11px] font-black uppercase tracking-widest text-dm-accent-ink shadow-[5px_5px_0_0_var(--dm-border-strong)] transition hover:-translate-y-px"
                  >
                    Open pulse
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="rounded-none border-[3px] border-dm-electric bg-dm-electric px-8 py-3.5 font-mono text-[11px] font-black uppercase tracking-widest text-white shadow-[5px_5px_0_0_var(--dm-border-strong)] transition hover:bg-dm-electric-glow"
                    >
                      Create account
                    </Link>
                    <Link
                      href="/login"
                      className="rounded-none border-[3px] border-dm-border-strong bg-dm-surface px-8 py-3.5 font-mono text-[11px] font-black uppercase tracking-widest text-dm-text shadow-[5px_5px_0_0_var(--dm-electric)] transition hover:bg-dm-elevated"
                    >
                      Log in
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center px-6 py-14 lg:px-12">
            <div className="space-y-6 font-mono text-xs font-bold uppercase tracking-widest text-dm-muted">
              <div className="flex items-start gap-4 border-[3px] border-dm-electric bg-dm-bg p-5 shadow-[6px_6px_0_0_var(--dm-border-strong)]">
                <span className="text-lg" aria-hidden>
                  ⚡
                </span>
                <div>
                  <p className="text-dm-text">Electric truth layer</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase leading-snug tracking-wide text-dm-muted">
                    Live receipt reads · settlement graph incoming
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 border-[3px] border-dm-muted/40 bg-dm-surface p-5">
                <span className="text-lg" aria-hidden>
                  ◆
                </span>
                <div>
                  <p className="text-dm-text">Submarine OLED dark</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase leading-snug tracking-wide text-dm-muted">
                    Auto night stack for ramen-hour accounting
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-4 border-[3px] border-dm-accent bg-dm-accent/10 p-5">
                <span className="text-lg text-dm-accent-ink" aria-hidden>
                  ✚
                </span>
                <div>
                  <p className="text-dm-text">Mint only for kinetic wins</p>
                  <p className="mt-2 text-[11px] font-semibold uppercase leading-snug tracking-wide text-dm-muted">
                    Pays / confirmations / triumphant settles
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
