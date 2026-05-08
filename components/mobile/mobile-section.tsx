import type { ReactNode } from "react";

type Props = {
  title: string;
  description?: string;
  /** Hide description below lg — reduces noise on phones while keeping desktop copy unchanged where sections show on both. */
  hideDescriptionMobile?: boolean;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function MobileSection({
  title,
  description,
  hideDescriptionMobile,
  action,
  children,
  className = "",
}: Props) {
  return (
    <section
      className={`rounded-2xl border border-[var(--dm-border)] bg-dm-surface/95 p-4 shadow-[var(--cozy-shadow-paper)] max-lg:p-[1.125rem] lg:rounded-xl lg:border-[var(--dm-border-strong)] lg:shadow-none ${className}`}
    >
      <div className="mb-3 flex flex-wrap items-start justify-between gap-x-2 gap-y-3 max-lg:mb-3.5">
        <div className="min-w-0 flex-1">
          <h2 className="font-cozy-display text-[1.35rem] leading-[1.2] tracking-tight text-dm-text max-lg:text-[1.45rem] lg:text-2xl">
            {title}
          </h2>
          {description ?
            <p
              className={`mt-1.5 text-[13px] leading-relaxed text-dm-muted lg:leading-snug ${hideDescriptionMobile ? "hidden lg:block" : ""}`}
            >
              {description}
            </p>
          : null}
        </div>
        {action ? <div className="shrink-0 self-start pt-0.5">{action}</div> : null}
      </div>
      {children}
    </section>
  );
}
