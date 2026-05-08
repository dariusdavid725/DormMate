"use client";

import type { ComponentProps } from "react";
import { useEffect, useId, useRef, useState } from "react";
import { useFormStatus } from "react-dom";

import type { AvatarUploadState } from "@/lib/profiles/actions";
import { normalizeAvatarImageForUpload } from "@/lib/profiles/avatar-compress-client";
import {
  assignAvatarFileToInput,
  clearFileInput,
} from "@/lib/profiles/avatar-input";

function AvatarSubmitIdle({ idle }: { idle: string }) {
  const { pending } = useFormStatus();
  return pending ? "Uploading…" : idle;
}

type Props = {
  formAction: NonNullable<ComponentProps<"form">["action"]>;
  avatarState: AvatarUploadState;
  currentAvatarUrl: string | null;
  householdId?: string;
  legend: string;
  variant: "settings" | "household";
  successFlash?: boolean;
  idleLabel?: string;
};

export function AvatarUploadFormBlock({
  formAction,
  avatarState,
  currentAvatarUrl,
  householdId,
  legend,
  variant,
  successFlash,
  idleLabel = "Save avatar",
}: Props) {
  const baseId = useId();
  const galleryInputId = `${baseId}-gallery`;
  const cameraInputId = `${baseId}-camera`;
  const hiddenSubmitRef = useRef<HTMLInputElement>(null);
  const galleryRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const desktopGalleryRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [hasPendingAvatar, setHasPendingAvatar] = useState(false);
  const [clientErr, setClientErr] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [serverErrEcho, setServerErrEcho] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  useEffect(() => {
    if (avatarState?.error) {
      setServerErrEcho(avatarState.error);
    }
    if (avatarState?.ok) {
      setServerErrEcho(null);
    }
  }, [avatarState]);

  useEffect(() => {
    if (!avatarState?.ok) return;
    setClientErr(null);
    setHasPendingAvatar(false);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    clearFileInput(galleryRef.current);
    clearFileInput(cameraRef.current);
    clearFileInput(desktopGalleryRef.current);
    clearFileInput(hiddenSubmitRef.current);
  }, [avatarState?.ok]);

  const thumbClass =
    variant === "settings" ?
      "h-20 w-20 rounded-2xl"
    : "h-16 w-16 rounded-2xl";

  const legendClass =
    variant === "settings" ?
      "block text-xs font-semibold uppercase tracking-wide text-dm-muted"
    : "text-[11px] font-semibold uppercase tracking-wide text-dm-muted";

  const hint =
    variant === "settings" ?
      "Photos are resized on your phone for a fast upload. HEIC photos work when Safari can decode them."
    : "JPEG, PNG, WebP, HEIC · up to 15MB picked, then shrunk before upload.";

  async function handleRawFilePick(file: File | null | undefined) {
    if (!file?.size) return;
    try {
      setClientErr(null);
      setServerErrEcho(null);

      setProcessing(true);
      const normalized = await normalizeAvatarImageForUpload(file);
      if (!normalized.ok) {
        setClientErr(normalized.error);
        setHasPendingAvatar(false);
        setProcessing(false);
        return;
      }

      assignAvatarFileToInput(normalized.file, hiddenSubmitRef.current);
      setHasPendingAvatar(true);

      setPreviewUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return normalized.previewObjectUrl;
      });
    } catch (e: unknown) {
      console.error("[profiles] avatar pick handler crashed", e);
      setClientErr("Couldn't upload avatar. Please try again.");
      setHasPendingAvatar(false);
    } finally {
      setProcessing(false);
      clearFileInput(galleryRef.current);
      clearFileInput(cameraRef.current);
      clearFileInput(desktopGalleryRef.current);
    }
  }

  function clearSelection() {
    setHasPendingAvatar(false);
    setClientErr(null);
    setServerErrEcho(null);
    setPreviewUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return null;
    });
    clearFileInput(galleryRef.current);
    clearFileInput(cameraRef.current);
    clearFileInput(desktopGalleryRef.current);
    clearFileInput(hiddenSubmitRef.current);
  }

  const displayErr = clientErr ?? serverErrEcho;

  return (
    <form
      action={formAction}
      encType="multipart/form-data"
      className={
        variant === "settings" ?
          "space-y-3 border-t border-[var(--dm-border)] pt-6"
        : "mt-6 space-y-3 border-t border-[var(--dm-border)] pt-6"
      }
    >
      {householdId ?
        <input type="hidden" name="household_id" value={householdId} />
      : null}

      <input
        ref={hiddenSubmitRef}
        type="file"
        name="avatar"
        tabIndex={-1}
        className="sr-only"
        aria-hidden
      />

      <p className={legendClass}>{legend}</p>

      {displayErr ?
        <p
          role="alert"
          className={
            variant === "settings" ?
              "rounded-md border border-dm-danger/40 px-3 py-2 text-sm text-dm-danger"
            : "mt-2 rounded-lg border border-dm-danger/35 px-3 py-2 text-[12px] text-dm-danger"
          }
        >
          {displayErr}
        </p>
      : null}

      {processing ?
        <p className="text-[13px] text-dm-muted">Preparing your photo…</p>
      : null}

      {successFlash ?
        <p
          className={
            variant === "settings" ?
              "rounded-md border border-[var(--dm-border-strong)] px-3 py-2 text-sm text-dm-muted"
            : "mt-2 rounded-lg border border-[var(--dm-border-strong)] px-3 py-2 text-[12px] text-dm-muted"
          }
        >
          Avatar updated.
        </p>
      : null}

      <div
        className={
          variant === "settings" ?
            "mt-3 flex flex-wrap gap-4"
          : "mt-3 flex flex-wrap gap-3"
        }
      >
        {previewUrl ?
          // eslint-disable-next-line @next/next/no-img-element -- avatar preview blob URL
          <img
            src={previewUrl}
            alt=""
            className={`${thumbClass} shrink-0 border border-[var(--dm-border-strong)] object-cover`}
          />
        : currentAvatarUrl ?
          // eslint-disable-next-line @next/next/no-img-element -- saved avatar URL
          <img
            src={currentAvatarUrl}
            alt=""
            className={`${thumbClass} shrink-0 border border-[var(--dm-border-strong)] object-cover`}
          />
        : (
          <div
            className={`flex ${thumbClass} shrink-0 items-center justify-center border border-dashed border-[var(--dm-border-strong)] bg-dm-bg/50 text-[10px] text-dm-muted`}
          >
            {variant === "settings" ? "No photo yet" : "No photo"}
          </div>
        )}

        <div className="min-w-0 flex-1 space-y-2">
          <p className={variant === "settings" ? "text-xs text-dm-muted" : "text-[11px] text-dm-muted"}>
            {hint}
          </p>

          {/* iOS-safe: labeled controls (htmlFor → input id), gallery without capture */}
          <div className="flex flex-wrap gap-2">
            <label
              htmlFor={galleryInputId}
              className={
                variant === "settings" ?
                  "motion-reduce:transition-none flex min-h-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-md border border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-text duration-150 max-sm:flex-1 sm:hidden"
                : "flex min-h-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-xl border border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-text sm:hidden"
              }
            >
              {variant === "settings" ? "Choose photo" : "Gallery"}
            </label>

            <input
              ref={galleryRef}
              id={galleryInputId}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                void handleRawFilePick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            <label
              htmlFor={cameraInputId}
              className={
                variant === "settings" ?
                  "motion-reduce:transition-none flex min-h-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-md bg-dm-electric px-4 py-2 text-xs font-semibold text-white duration-150 max-sm:flex-1 sm:hidden"
                : "flex min-h-[44px] cursor-pointer touch-manipulation items-center justify-center rounded-xl bg-dm-electric px-4 py-2 text-xs font-semibold text-white sm:hidden"
              }
            >
              {variant === "settings" ? "Take photo" : "Camera"}
            </label>

            <input
              ref={cameraRef}
              id={cameraInputId}
              type="file"
              accept="image/*"
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                void handleRawFilePick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />

            <label
              htmlFor={`${galleryInputId}-desktop`}
              className={`hidden min-h-[44px] cursor-pointer touch-manipulation items-center rounded-md border border-[var(--dm-border-strong)] px-4 py-2 text-xs font-semibold text-dm-text sm:inline-flex ${variant === "household" ? "rounded-xl" : ""}`}
            >
              {variant === "settings" ? "Upload from computer" : "Upload file"}
            </label>
            <input
              ref={desktopGalleryRef}
              id={`${galleryInputId}-desktop`}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                void handleRawFilePick(e.target.files?.[0]);
                e.target.value = "";
              }}
            />
          </div>
        </div>
      </div>

      <div
        className={
          variant === "settings" ?
            "flex flex-wrap items-center gap-2"
          : "mt-4 flex flex-wrap items-center gap-2"
        }
      >
        <button
          type="submit"
          disabled={!hasPendingAvatar || processing}
          className={
            variant === "settings" ?
              "touch-manipulation min-h-[44px] rounded-md border border-[var(--dm-border-strong)] px-5 py-2 text-sm font-semibold text-dm-text disabled:opacity-50"
            : "touch-manipulation min-h-[44px] rounded-full border border-[var(--dm-border-strong)] bg-dm-surface px-6 py-2.5 text-sm font-semibold text-dm-text shadow-sm hover:border-dm-electric disabled:opacity-50"
          }
        >
          <AvatarSubmitIdle idle={idleLabel} />
        </button>
        <button
          type="button"
          onClick={clearSelection}
          className={`touch-manipulation min-h-[44px] px-4 text-xs font-semibold text-dm-muted hover:text-dm-text ${variant === "household" ? "px-3" : ""}`}
        >
          Clear
        </button>
      </div>
    </form>
  );
}
