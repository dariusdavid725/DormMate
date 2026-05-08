import Link from "next/link";
import type { ReactNode } from "react";

type Base = {
  label: string;
  hint?: string;
  icon?: ReactNode;
  className?: string;
};

type LinkProps = Base & {
  href: string;
  external?: boolean;
};

export function MobileActionCardLink({
  href,
  label,
  hint,
  icon,
  external,
  className = "",
}: LinkProps) {
  const inner = (
    <>
      {icon ?
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dm-accent-soft)_100%,transparent)] text-lg text-[var(--dm-electric-deep)] max-lg:h-[52px] max-lg:w-[52px]">
          {icon}
        </span>
      : null}
      <span className="min-w-0 flex-1 text-left">
        <span className="block text-[16px] font-semibold leading-snug text-dm-text lg:text-[15px]">
          {label}
        </span>
        {hint ?
          <span className="mt-1 block text-[13px] leading-snug text-dm-muted lg:mt-0.5 lg:text-[12px]">
            {hint}
          </span>
        : null}
      </span>
      <span className="shrink-0 ps-1 text-dm-muted-soft" aria-hidden>
        →
      </span>
    </>
  );

  const box = [
    "dm-interactive dm-focus-ring touch-manipulation flex min-h-[56px] w-full max-w-full items-center gap-3 rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface-mid/60 px-4 py-3 text-dm-text shadow-[1px_2px_0_rgba(54,47,40,0.05)] transition-[transform,box-shadow] active:scale-[0.99] lg:min-h-[52px] lg:px-3 lg:py-2.5",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dm-electric)]",
    className,
  ].join(" ");

  if (external) {
    return (
      <a href={href} className={box} target="_blank" rel="noreferrer">
        {inner}
      </a>
    );
  }

  return (
    <Link href={href} prefetch className={box}>
      {inner}
    </Link>
  );
}

export function MobileActionCardButton({
  label,
  hint,
  icon,
  className = "",
  ...rest
}: Base &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "className"> & {
    className?: string;
  }) {
  return (
    <button
      type="button"
      className={[
        "dm-interactive dm-focus-ring touch-manipulation flex min-h-[56px] w-full max-w-full items-center gap-3 rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface-mid/60 px-4 py-3 text-left text-dm-text shadow-[1px_2px_0_rgba(54,47,40,0.05)] transition-[transform,box-shadow] active:scale-[0.99] lg:min-h-[52px] lg:px-3 lg:py-2.5",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--dm-electric)]",
        className,
      ].join(" ")}
      {...rest}
    >
      {icon ?
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[color-mix(in_srgb,var(--dm-accent-soft)_100%,transparent)] text-lg text-[var(--dm-electric-deep)] max-lg:h-[52px] max-lg:w-[52px]">
          {icon}
        </span>
      : null}
      <span className="min-w-0 flex-1">
        <span className="block text-[16px] font-semibold leading-snug text-dm-text lg:text-[15px]">
          {label}
        </span>
        {hint ?
          <span className="mt-1 block text-[13px] leading-snug text-dm-muted lg:mt-0.5 lg:text-[12px]">
            {hint}
          </span>
        : null}
      </span>
    </button>
  );
}
