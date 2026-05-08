"use client";

import {
  IN_APP_PWA_DISMISS_KEY,
  usePwaInstall,
} from "@/hooks/use-pwa-install";

/** Mobile "/" entry — install chrome CTA + iOS home screen helper. */
export function PwaInstallMarketingMobile() {
  const {
    showNativeInstallUi,
    showIosInstallGuide,
    dismiss,
    install,
    installBusy,
    fallbackMessage,
  } = usePwaInstall({ dismissalKey: "marketing-mobile" });

  if (!showNativeInstallUi && !showIosInstallGuide) return null;

  return (
    <div className="mx-auto w-full max-w-sm space-y-3">
      {fallbackMessage ?
        <p
          role="status"
          className="rounded-xl border border-dm-danger/30 bg-red-500/[0.06] px-3 py-2 text-center text-[12px] text-dm-danger"
        >
          {fallbackMessage}
        </p>
      : null}

      {showIosInstallGuide ?
        <div className="rounded-2xl border border-[color-mix(in_srgb,var(--dm-accent)_32%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-accent-soft)_22%,white)] px-4 py-3 shadow-[var(--dm-shadow-soft)]">
          <p className="text-[13px] font-bold text-dm-text">
            Add Koti to your Home Screen
          </p>
          <p className="mt-1.5 text-[12px] leading-snug text-dm-muted">
            Tap <span className="font-semibold text-dm-text">Share</span>, then{" "}
            <span className="font-semibold text-dm-text">
              Add to Home Screen
            </span>
            .
          </p>
          <button
            type="button"
            onClick={dismiss}
            className="touch-manipulation mt-3 text-[11px] font-semibold text-dm-electric underline-offset-2 hover:underline"
          >
            Maybe later
          </button>
        </div>
      : null}

      {showNativeInstallUi ?
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => {
              void install();
            }}
            disabled={installBusy}
            className="dm-focus-ring motion-reduce:transition-none flex min-h-[52px] w-full touch-manipulation items-center justify-center rounded-2xl border-2 border-dm-electric/90 bg-[color-mix(in_srgb,var(--dm-electric)_8%,white)] px-5 text-[15px] font-bold text-[var(--dm-electric-deep)] shadow-[inset_0_1px_0_rgba(255,255,255,0.65)] duration-150 active:scale-[0.987] motion-reduce:active:scale-100 disabled:opacity-65"
          >
            {installBusy ? "Opening…" : "Install app"}
          </button>
          <button
            type="button"
            onClick={dismiss}
            className="touch-manipulation w-full py-1 text-center text-[11px] font-semibold text-dm-muted-soft hover:text-dm-muted"
          >
            Maybe later
          </button>
        </div>
      : null}
    </div>
  );
}

/** Desktop "/" hero — unobtrusive chromium install chip. */
export function PwaInstallDesktopHint() {
  const {
    showNativeInstallUi,
    dismiss,
    install,
    installBusy,
    fallbackMessage,
  } = usePwaInstall({ dismissalKey: "marketing-desktop" });

  if (!showNativeInstallUi) return null;

  return (
    <div className="mt-8 border-t border-dashed border-[var(--dm-border-strong)] pt-6">
      {fallbackMessage ?
        <p className="text-[13px] text-dm-danger">{fallbackMessage}</p>
      : null}
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <button
          type="button"
          onClick={() => {
            void install();
          }}
          disabled={installBusy}
          className="inline-flex min-h-[44px] items-center rounded-md border border-[var(--dm-border-strong)] bg-dm-surface px-4 py-2 text-sm font-semibold text-dm-text hover:border-dm-electric disabled:opacity-60"
        >
          {installBusy ? "Opening…" : "Install app"}
        </button>
        <button
          type="button"
          onClick={dismiss}
          className="text-sm font-medium text-dm-muted-soft hover:text-dm-muted"
        >
          Maybe later
        </button>
      </div>
      <p className="mt-3 max-w-xl text-[12px] text-dm-muted">
        Opens Koti in its own window, like an app — no clutter from other tabs.
      </p>
    </div>
  );
}

/** Dashboard `/dashboard/more` — compact combined card. */
export function PwaInstallMoreCard() {
  const {
    showNativeInstallUi,
    showIosInstallGuide,
    dismiss,
    install,
    installBusy,
    fallbackMessage,
  } = usePwaInstall({ dismissalKey: IN_APP_PWA_DISMISS_KEY });

  if (!showNativeInstallUi && !showIosInstallGuide) return null;

  return (
    <aside className="overflow-hidden rounded-2xl border border-[color-mix(in_srgb,var(--dm-accent)_26%,var(--dm-border-strong))] bg-[color-mix(in_srgb,var(--dm-accent-soft)_12%,var(--dm-surface))] p-4 shadow-[var(--cozy-shadow-note)] lg:p-5">
      {fallbackMessage ?
        <p className="mb-3 rounded-lg border border-dm-danger/30 bg-red-500/[0.05] px-3 py-2 text-[12px] text-dm-danger">
          {fallbackMessage}
        </p>
      : null}

      {showIosInstallGuide ?
        <div>
          <p className="text-[14px] font-bold leading-snug text-dm-text">
            Add Koti to your Home Screen
          </p>
          <p className="mt-2 text-[13px] leading-snug text-dm-muted">
            Tap Share, then Add to Home Screen — it&apos;ll behave like its own app.
          </p>
        </div>
      : showNativeInstallUi ?
        <div>
          <p className="text-[14px] font-bold leading-snug text-dm-text">
            Install Koti
          </p>
          <p className="mt-2 text-[13px] leading-snug text-dm-muted">
            One tap to add Koti like a native app — quick to open anytime.
          </p>
          <button
            type="button"
            onClick={() => {
              void install();
            }}
            disabled={installBusy}
            className="touch-manipulation mt-4 flex min-h-[48px] w-full items-center justify-center rounded-xl bg-dm-electric px-4 text-[15px] font-bold text-white hover:brightness-105 disabled:opacity-60"
          >
            {installBusy ? "Opening…" : "Install app"}
          </button>
        </div>
      : null}

      <button
        type="button"
        onClick={dismiss}
        className="touch-manipulation mt-3 w-full rounded-lg py-2 text-[12px] font-semibold text-dm-muted-soft hover:bg-black/[0.03] hover:text-dm-muted"
      >
        Maybe later
      </button>
    </aside>
  );
}
