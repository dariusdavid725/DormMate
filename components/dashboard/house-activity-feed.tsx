import Link from "next/link";

import type { HouseActivityItem } from "@/lib/dashboard/house-activity";
import { formatRelativeTime } from "@/lib/format-relative";

export function HouseActivityFeed({
  items,
}: {
  items: HouseActivityItem[];
}) {
  if (items.length === 0) {
    return (
      <div className="cozy-note cozy-tilt-xs px-4 py-6 text-center text-[13px] text-dm-muted">
        Quiet hallway — notes will land here soon.
      </div>
    );
  }

  return (
    <ul className="cozy-poster divide-y divide-dashed divide-[rgba(91,83,71,0.2)] px-3 py-2">
      {items.map((item, i) => {
        if (item.kind === "generic_note") {
          return (
            <li
              key={`g-${item.id}`}
              className="cozy-drop-in px-3 py-3 cozy-hover-wiggle rounded-sm bg-[rgba(254,253,249,0.72)] sm:ml-2 sm:mr-6"
              style={{ animationDelay: `${Math.min(i, 8) * 42}ms` }}
            >
              <p className="text-[12px] font-semibold uppercase tracking-wide text-dm-muted">
                {item.label}
              </p>
              <p className="mt-1 text-[13px] text-dm-text">{item.body}</p>
              <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] text-dm-muted">
                <span>{item.householdName}</span>
                <span>{formatRelativeTime(item.at)}</span>
                {item.href ?
                  <Link
                    href={item.href}
                    className="font-semibold text-dm-electric hover:underline"
                  >
                    Peek
                  </Link>
                : null}
              </p>
            </li>
          );
        }

        if (item.kind === "receipt_saved") {
          return (
            <li
              key={`r-${item.id}`}
              className="cozy-drop-in px-3 py-3 cozy-hover-wiggle rounded-sm bg-[rgba(254,253,249,0.65)] sm:ml-3 sm:mr-5"
              style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
            >
              <p className="text-[12px] font-medium uppercase tracking-wider text-dm-muted">
                Receipt
              </p>
              <p className="mt-1 text-[13px] text-dm-text">
                <span className="font-semibold">{item.savedByLabel}</span>
                {" · "}
                {item.merchant?.trim() || "shop"}{" "}
                <span className="font-mono tabular-nums">{item.amountLabel}</span>
              </p>
              <p className="mt-1 text-[11px] text-dm-muted">{item.householdName}</p>
              <p className="mt-2 flex items-center gap-3 text-[11px] text-dm-muted">
                <span>{formatRelativeTime(item.at)}</span>
                <Link
                  href={`/dashboard/household/${item.householdId}?view=receipts`}
                  className="font-semibold text-dm-electric hover:underline"
                >
                  Open
                </Link>
              </p>
            </li>
          );
        }

        return (
          <li
            key={`t-${item.id}`}
            className={[
              "cozy-note cozy-drop-in mx-2 my-2 px-3 py-2.5 cozy-hover-wiggle cozy-tilt-xs-alt",
              "border border-[rgba(91,79,54,0.12)] shadow-[var(--cozy-shadow-note)]",
            ].join(" ")}
            style={{ animationDelay: `${Math.min(i, 8) * 45}ms` }}
          >
            <p className="text-[12px] font-semibold uppercase tracking-wide text-dm-muted">
              Chore done
            </p>
            <p className="mt-0.5 text-[13px] text-dm-text">
              <span className="font-semibold">{item.completedByLabel}</span>
              {": "}
              {item.title}
            </p>
            <p className="mt-1 text-[11px] text-dm-muted">
              +{item.points} pts · {item.householdName} · {formatRelativeTime(item.at)}
            </p>
            <Link
              href={`/dashboard/household/${item.householdId}?view=tasks`}
              className="mt-1.5 inline-block text-[11px] font-semibold text-dm-electric hover:underline"
            >
              Tasks
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
