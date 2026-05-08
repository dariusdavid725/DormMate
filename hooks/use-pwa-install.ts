"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export const DEFAULT_PWA_INSTALL_DISMISS_MS = 7 * 24 * 60 * 60 * 1000;

/** Shared dismissal for in-product surfaces (More, Settings). */
export const IN_APP_PWA_DISMISS_KEY = "in-app";

const DEFAULT_DISMISS_MS = DEFAULT_PWA_INSTALL_DISMISS_MS;

function dismissalStorageKey(scope: string) {
  return `koti:pwa-install-dismiss:${scope}`;
}

const PWA_DISMISS_SYNC = "koti:pwa-install-dismiss";

function readCoolingDown(
  dismissalKey: string,
  dismissCooldownMs: number,
): boolean {
  try {
    const raw = localStorage.getItem(dismissalStorageKey(dismissalKey));
    if (!raw) return false;
    const ts = Number(raw);
    if (Number.isNaN(ts)) return false;
    return Date.now() - ts < dismissCooldownMs;
  } catch {
    return false;
  }
}

/** True when running inside an installed/A2HS-launched standalone web app. */
export function isLikelyStandalone(): boolean {
  if (typeof window === "undefined") return false;
  if (window.matchMedia("(display-mode: standalone)").matches) return true;
  const nav = window.navigator as Navigator & { standalone?: boolean };
  return nav.standalone === true;
}

export function isIosDevice(): boolean {
  if (typeof window === "undefined") return false;
  if (/iPad|iPhone|iPod/.test(window.navigator.userAgent)) return true;
  return (
    window.navigator.platform === "MacIntel" &&
    window.navigator.maxTouchPoints > 1
  );
}

type BeforeInstallPromptEventTyped = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
};

export type UsePwaInstallOptions = {
  dismissalKey: string;
  dismissCooldownMs?: number;
};

export type UsePwaInstallResult = {
  mounted: boolean;
  standalone: boolean;
  coolingDown: boolean;
  /** Chromium et al.: true only after beforeinstallprompt has fired */
  nativePromptReady: boolean;
  showNativeInstallUi: boolean;
  /** Safari / browsers with no deferred prompt — home screen instructions */
  showIosInstallGuide: boolean;
  dismiss: () => void;
  install: () => Promise<void>;
  installBusy: boolean;
  fallbackMessage: string | null;
};

export function usePwaInstall(options: UsePwaInstallOptions): UsePwaInstallResult {
  const { dismissalKey, dismissCooldownMs = DEFAULT_DISMISS_MS } = options;
  const deferredRef = useRef<BeforeInstallPromptEventTyped | null>(null);
  const [mounted, setMounted] = useState(false);
  const [standalone, setStandalone] = useState(false);
  const [coolingDown, setCoolingDown] = useState(false);
  const [nativePromptReady, setNativePromptReady] = useState(false);
  const [installBusy, setInstallBusy] = useState(false);
  const [fallbackMessage, setFallbackMessage] = useState<string | null>(null);

  const dismiss = useCallback(() => {
    try {
      localStorage.setItem(
        dismissalStorageKey(dismissalKey),
        String(Date.now()),
      );
    } catch {
      /* ignore */
    }
    setCoolingDown(true);
    try {
      window.dispatchEvent(new Event(PWA_DISMISS_SYNC));
    } catch {
      /* ignore */
    }
  }, [dismissalKey]);

  useEffect(() => {
    setMounted(true);
    setStandalone(isLikelyStandalone());
    setCoolingDown(readCoolingDown(dismissalKey, dismissCooldownMs));
  }, [dismissalKey, dismissCooldownMs]);

  useEffect(() => {
    const sync = () =>
      setCoolingDown(readCoolingDown(dismissalKey, dismissCooldownMs));
    window.addEventListener(PWA_DISMISS_SYNC, sync);
    return () => window.removeEventListener(PWA_DISMISS_SYNC, sync);
  }, [dismissalKey, dismissCooldownMs]);

  useEffect(() => {
    if (!mounted || standalone) return;
    const handler = (e: Event) => {
      try {
        e.preventDefault();
      } catch {
        /* ignore */
      }
      deferredRef.current = e as BeforeInstallPromptEventTyped;
      setNativePromptReady(true);
      setFallbackMessage(null);
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, [mounted, standalone]);

  useEffect(() => {
    const onInstalled = () => {
      deferredRef.current = null;
      setNativePromptReady(false);
      setStandalone(true);
      setFallbackMessage(null);
      setCoolingDown(false);
    };
    window.addEventListener("appinstalled", onInstalled);
    return () => window.removeEventListener("appinstalled", onInstalled);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const mq = window.matchMedia("(display-mode: standalone)");
    const listener = () => setStandalone(isLikelyStandalone());
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, [mounted]);

  const install = useCallback(async () => {
    const deferred = deferredRef.current;
    if (!deferred) {
      setFallbackMessage(
        "Install isn’t available in this browser right now. Try Chrome or Edge.",
      );
      window.setTimeout(() => setFallbackMessage(null), 5000);
      return;
    }
    setInstallBusy(true);
    setFallbackMessage(null);
    try {
      await deferred.prompt();
      const choice = await deferred.userChoice;
      deferredRef.current = null;
      setNativePromptReady(false);
      if (choice.outcome === "dismissed") {
        dismiss();
      }
    } catch (e: unknown) {
      console.error("[pwa] install prompt failed", e);
      deferredRef.current = null;
      setNativePromptReady(false);
      setFallbackMessage(
        "Couldn’t open the install sheet. Use your browser menu to install.",
      );
      window.setTimeout(() => setFallbackMessage(null), 5000);
    } finally {
      setInstallBusy(false);
    }
  }, [dismiss]);

  const showNativeInstallUi =
    mounted &&
    !standalone &&
    !coolingDown &&
    nativePromptReady;

  const showIosInstallGuide =
    mounted &&
    !standalone &&
    !coolingDown &&
    isIosDevice() &&
    !nativePromptReady;

  return {
    mounted,
    standalone,
    coolingDown,
    nativePromptReady,
    showNativeInstallUi,
    showIosInstallGuide,
    dismiss,
    install,
    installBusy,
    fallbackMessage,
  };
}
