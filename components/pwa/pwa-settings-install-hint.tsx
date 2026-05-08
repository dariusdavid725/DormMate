"use client";

import {
  IN_APP_PWA_DISMISS_KEY,
  usePwaInstall,
} from "@/hooks/use-pwa-install";

/** Unobtrusive install row on Settings (shares 7-day dismiss with More). */
export function PwaSettingsInstallHint() {
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
    <div className="rounded-xl border border-[var(--dm-border-strong)] bg-dm-surface-mid/40 px-4 py-3">
      {fallbackMessage ?
        <p className="mb-2 text-[12px] text-dm-danger">{fallbackMessage}</p>
      : null}
      {showIosInstallGuide ?
        <>
          <p className="text-[13px] font-semibold text-dm-text">
            Add Koti to your Home Screen
          </p>
          <p className="mt-1 text-[12px] leading-snug text-dm-muted">
            Tap Share, then Add to Home Screen.
          </p>
        </>
      : (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[13px] text-dm-muted">
            Install Koti like an app on this device.
          </p>
          <button
            type="button"
            onClick={() => {
              void install();
            }}
            disabled={installBusy}
            className="touch-manipulation inline-flex min-h-[44px] shrink-0 items-center justify-center rounded-lg bg-dm-electric px-4 text-sm font-semibold text-white hover:brightness-105 disabled:opacity-60"
          >
            {installBusy ? "Opening…" : "Install app"}
          </button>
        </div>
      )}
      <button
        type="button"
        onClick={dismiss}
        className="touch-manipulation mt-2 text-[11px] font-semibold text-dm-muted-soft hover:text-dm-muted"
      >
        Maybe later
      </button>
    </div>
  );
}
