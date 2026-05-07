"use client";

import { useEffect } from "react";

/**
 * Registers the minimal service worker (static `/_next/static/*` only).
 * Skips dev to avoid confusing HMR / stale chunk issues.
 */
export function RegisterServiceWorker() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (!("serviceWorker" in navigator)) return;

    void navigator.serviceWorker
      .register("/sw.js", { scope: "/" })
      .catch((err: unknown) => {
        console.warn("[pwa] service worker registration failed", err);
      });
  }, []);

  return null;
}
