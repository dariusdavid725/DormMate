import Link from "next/link";

import type { HouseActivityItem } from "@/lib/dashboard/house-activity";
import { formatRelativeTime } from "@/lib/format-relative";

function ActivitySamplePeek() {
  return (
    <div
      aria-hidden
      className="border-t border-dashed border-[color-mix(in_srgb,var(--dm-electric)_25%,transparent)] bg-[linear-gradient(180deg,color-mix(in_srgb,var(--dm-electric)_6%,transparent),transparent)]"
    >
      <p className="px-6 pt-5 text-[10px] font-black uppercase tracking-[0.35em] text-dm-muted">
        Sample vibes (preview)
      </p>
      <div className="divide-y divide-[var(--dm-border)] opacity-[0.82]">
        <div className="flex gap-3 px-6 py-4 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dm-fun)_16%,transparent)] text-[14px]">
            🎯
          </div>
          <div className="min-w-0">
            <p className="text-[13px] leading-snug text-dm-muted">
              <span className="font-semibold text-dm-text">Maya</span> finished{" "}
              <span className="italic text-dm-text/90">&ldquo;Take bins out&rdquo;</span>
            </p>
            <p className="mt-1 text-[12px] font-semibold text-dm-accent">+35 pts · shared flat</p>
          </div>
        </div>
        <div className="flex gap-3 px-6 py-4 sm:gap-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dm-accent-soft)] text-[14px]">
            🧾
          </div>
          <div className="min-w-0">
            <p className="text-[13px] leading-snug text-dm-muted">
              <span className="font-semibold text-dm-text">Leo</span> tucked in a Tesco run{" "}
              <span className="font-mono font-semibold tabular-nums text-dm-accent">
                €48.92
              </span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export function HouseActivityFeed({
  items,
  showSamples = false,
}: {
  items: HouseActivityItem[];
  showSamples?: boolean;
}) {
  const showPeek = showSamples && items.length === 0;

  return (
    <div className="dm-card-surface overflow-hidden rounded-[1.35rem] ring-1 ring-[color-mix(in_srgb,var(--dm-electric)_12%,transparent)]">
      {items.length === 0 ? (
        <div className="dm-fade-in-up px-6 py-8 text-center sm:py-10">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--dm-fun)_14%,transparent)] text-2xl shadow-inner ring-1 ring-[color-mix(in_srgb,var(--dm-fun)_28%,transparent)]">
            📭
          </div>
          <p className="text-[15px] font-bold leading-snug text-dm-text">
            Quiet flat energy — nobody&apos;s flexing receipts yet.
          </p>
          <p className="mx-auto mt-3 max-w-sm text-[13px] leading-relaxed text-dm-muted">
            First scan pops in glowing green. Chore wins parachute here too, so everyone
            knows who took out the chaotic recycling.
          </p>
        </div>
      ) : null}

      {items.map((item, i) => {
        const delay = Math.min(i, 10) * 38;
        if (item.kind === "receipt_saved") {
          return (
            <article
              key={`r-${item.id}`}
              className="dm-fade-in-up border-t border-[var(--dm-border)] first:border-t-0 px-5 py-4 sm:px-6"
              style={{ animationDelay: `${delay}ms` }}
            >
              <div className="flex gap-3 sm:gap-4">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--dm-accent-soft)] text-[15px] shadow-[inset_0_1px_0_rgba(255,255,255,.06)] ring-1 ring-[color-mix(in_srgb,var(--dm-accent)_22%,transparent)]"
                  aria-hidden
                >
                  🧾
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[13px] leading-snug text-dm-text">
                    <span className="font-bold">{item.savedByLabel}</span>{" "}
                    <span className="font-normal text-dm-muted">
                      smuggled in {item.merchant?.trim() || "a receipt"}
                    </span>{" "}
                    <span className="font-mono font-bold tabular-nums text-dm-accent">
                      {item.amountLabel}
                    </span>
                    <span className="font-normal text-dm-muted">
                      {" "}
                      · {item.householdName}
                    </span>
                  </p>
                  <p className="mt-1.5 text-[11px] text-dm-muted">
                    {formatRelativeTime(item.at)}
                  </p>
                  <Link
                    href={`/dashboard/household/${item.householdId}?view=receipts`}
                    className="dm-hover-tap mt-2 inline-flex text-xs font-bold text-dm-electric hover:underline"
                  >
                    View receipts →
                  </Link>
                </div>
              </div>
            </article>
          );
        }

        return (
          <article
            key={`t-${item.id}`}
            className="dm-fade-in-up border-t border-[var(--dm-border)] first:border-t-0 px-5 py-4 sm:px-6"
            style={{ animationDelay: `${delay}ms` }}
          >
            <div className="flex gap-3 sm:gap-4">
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dm-accent)_18%,transparent)] text-[13px] font-black text-[var(--dm-accent-ink)] ring-1 ring-[color-mix(in_srgb,var(--dm-accent)_30%,transparent)]"
                aria-hidden
              >
                ✓
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[13px] leading-snug text-dm-text">
                  <span className="font-bold">{item.completedByLabel}</span>{" "}
                  <span className="font-normal text-dm-muted">finished</span>{" "}
                  <span className="font-bold text-dm-text">
                    &ldquo;{item.title}&rdquo;
                  </span>
                </p>
                <p className="mt-1 text-[13px] font-bold text-dm-accent">
                  +{item.points} pts · {item.householdName}
                </p>
                <p className="mt-1.5 text-[11px] text-dm-muted">
                  {formatRelativeTime(item.at)}
                </p>
                <Link
                  href={`/dashboard/household/${item.householdId}?view=tasks`}
                  className="dm-hover-tap mt-2 inline-flex text-xs font-bold text-dm-electric hover:underline"
                >
                  Open tasks →
                </Link>
              </div>
            </div>
          </article>
        );
      })}

      {showPeek ? <ActivitySamplePeek /> : null}

      <article className="border-t border-[var(--dm-border-strong)] bg-[linear-gradient(95deg,color-mix(in_srgb,var(--dm-fun)_10%,transparent),transparent)] px-5 py-4 sm:px-6">
        <div className="flex gap-3">
          <div
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dm-fun)_14%,transparent)] text-[17px] ring-1 ring-[color-mix(in_srgb,var(--dm-fun)_35%,var(--dm-border))]"
            aria-hidden
          >
            ✨
          </div>
          <div className="min-w-0">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-dm-muted">
              Next up on the roadmap
            </p>
            <p className="mt-1.5 text-[13px] font-semibold leading-snug text-dm-text">
              “You owe Alex €6” lines land when splits ship — bye-bye spreadsheets in
              the notes app.
            </p>
            <p className="mt-2 text-[12px] leading-snug text-dm-muted">
              Room votes & mini-events will ride this same hallway so nobody vibes alone
              in the group chat.
            </p>
          </div>
        </div>
      </article>
    </div>
  );
}
