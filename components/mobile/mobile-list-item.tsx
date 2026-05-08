import Link from "next/link";
import type { ReactNode } from "react";

type Props = {
  title: string;
  subtitle?: ReactNode;
  meta?: ReactNode;
  href?: string;
  trailing?: ReactNode;
  className?: string;
};

export function MobileListItem({
  title,
  subtitle,
  meta,
  href,
  trailing,
  className = "",
}: Props) {
  const body = (
    <>
      <div className="min-w-0 flex-1 overflow-hidden">
        <p className="break-words text-[16px] font-semibold leading-snug text-dm-text lg:text-[15px]">
          {title}
        </p>
        {subtitle ?
          <div className="mt-1.5 break-words text-[14px] leading-relaxed text-dm-muted lg:mt-1 lg:text-[13px] lg:leading-snug">
            {subtitle}
          </div>
        : null}
        {meta ?
          <div className="mt-2 break-words text-[13px] leading-snug text-dm-muted-soft lg:text-[12px]">
            {meta}
          </div>
        : null}
      </div>
      {trailing ?
        <div className="max-lg:w-full max-lg:pt-1 lg:shrink-0 lg:self-center">{trailing}</div>
      : null}
    </>
  );

  const shell = [
    "dm-hover-lift flex max-lg:flex-col max-lg:gap-1 max-lg:py-4 min-h-[52px] flex-row items-start gap-3 rounded-xl border border-[var(--dm-border)] bg-dm-surface/90 px-4 py-3.5 shadow-[1px_2px_0_rgba(54,47,40,0.04)] lg:min-h-[48px] lg:flex-row lg:gap-3 lg:px-3 lg:py-3",
    className,
  ].join(" ");

  if (href) {
    return (
      <Link
        href={href}
        prefetch
        className={`${shell} dm-interactive dm-focus-ring touch-manipulation max-w-full transition-colors active:bg-dm-elevated/80`}
      >
        {body}
      </Link>
    );
  }

  return <div className={`${shell} max-w-full`}>{body}</div>;
}
