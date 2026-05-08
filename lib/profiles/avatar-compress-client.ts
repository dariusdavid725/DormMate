"use client";

import {
  AVATAR_TYPE_NOT_SUPPORTED,
  validateAvatarCandidateFile,
} from "@/lib/profiles/avatar-candidate-client";

const MAX_EDGE = 768;
const TARGET_MAX_BYTES = 1024 * 1024;

export const AVATAR_HEIC_NOT_DECODABLE =
  "This iPhone photo format could not be processed. Please choose another photo or set your camera format to Most Compatible.";

export type NormalizeAvatarResult =
  | { ok: true; file: File; previewObjectUrl: string }
  | { ok: false; error: string };

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: string,
  quality?: number,
): Promise<Blob | null> {
  return new Promise((resolve) => {
    try {
      canvas.toBlob((b) => resolve(b), type, quality);
    } catch {
      resolve(null);
    }
  });
}

type Drawable = {
  width: number;
  height: number;
  paint: (ctx: CanvasRenderingContext2D, tw: number, th: number) => void;
};

async function loadDrawable(file: File, objectUrl: string): Promise<Drawable | null> {
  if (typeof createImageBitmap === "function") {
    try {
      const b = await createImageBitmap(file);
      if (b.width > 0 && b.height > 0) {
        return {
          width: b.width,
          height: b.height,
          paint: (ctx, tw, th) => {
            try {
              ctx.drawImage(b, 0, 0, tw, th);
            } finally {
              b.close();
            }
          },
        };
      }
      b.close();
    } catch (e: unknown) {
      console.error("[profiles] createImageBitmap failed for avatar", e);
    }
  }

  const img = await new Promise<HTMLImageElement | null>((resolve) => {
    const el = new Image();
    el.onload = () => resolve(el);
    el.onerror = () => resolve(null);
    try {
      el.decoding = "async";
    } catch {
      /* ignore */
    }
    el.src = objectUrl;
  });

  if (!img?.naturalWidth) {
    return null;
  }
  return {
    width: img.naturalWidth,
    height: img.naturalHeight,
    paint: (ctx, tw, th) => {
      ctx.drawImage(img, 0, 0, tw, th);
    },
  };
}

/**
 * Resize (max 768 edge), compress toward &lt; 1MB, output JPEG or WebP.
 * Safe for HEIC only when the browser can decode it to a drawable.
 */
export async function normalizeAvatarImageForUpload(
  raw: File,
): Promise<NormalizeAvatarResult> {
  const pre = validateAvatarCandidateFile(raw);
  if (pre) {
    return { ok: false, error: pre };
  }

  const objectUrl = URL.createObjectURL(raw);
  try {
    const drawable = await loadDrawable(raw, objectUrl);
    if (!drawable) {
      return { ok: false, error: AVATAR_HEIC_NOT_DECODABLE };
    }

    const { width: dw, height: dh, paint } = drawable;
    const scale = Math.min(1, MAX_EDGE / Math.max(dw, dh));
    const tw = Math.max(1, Math.round(dw * scale));
    const th = Math.max(1, Math.round(dh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = tw;
    canvas.height = th;
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return { ok: false, error: "Couldn't upload avatar. Please try again." };
    }
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    paint(ctx, tw, th);

    const pickBestBlob = async (
      type: "image/jpeg" | "image/webp",
      qs: number[],
    ): Promise<{ under: Blob | null; fallback: Blob | null }> => {
      let smallest: Blob | null = null;
      let smallestUnderCap: Blob | null = null;
      for (const q of qs) {
        const b = await canvasToBlob(canvas, type, q);
        if (!b || b.size === 0) continue;
        if (type === "image/jpeg" && b.type !== "image/jpeg") continue;
        if (type === "image/webp" && b.type !== "image/webp") continue;
        if (!smallest || b.size < smallest.size) smallest = b;
        if (
          b.size <= TARGET_MAX_BYTES &&
          (!smallestUnderCap || b.size < smallestUnderCap.size)
        ) {
          smallestUnderCap = b;
        }
      }
      return { under: smallestUnderCap, fallback: smallest };
    };

    const jpegQs = [0.92, 0.86, 0.78, 0.7, 0.62, 0.54, 0.46, 0.38];
    const j = await pickBestBlob("image/jpeg", jpegQs);

    let webpBands: { under: Blob | null; fallback: Blob | null } = {
      under: null,
      fallback: null,
    };
    try {
      const webpQs = [0.9, 0.82, 0.74, 0.64, 0.52];
      webpBands = await pickBestBlob("image/webp", webpQs);
    } catch {
      /* WebP unsupported */
    }

    const underCand = [j.under, webpBands.under].filter(
      (b): b is Blob => b !== null,
    );
    const overCand = [j.fallback, webpBands.fallback].filter(
      (b): b is Blob => b !== null,
    );

    let outBlob: Blob | null = null;
    let outMime: "image/jpeg" | "image/webp" = "image/jpeg";

    if (underCand.length > 0) {
      outBlob = underCand.reduce((a, b) => (a.size <= b.size ? a : b));
      outMime =
        outBlob.type === "image/webp" ? "image/webp" : "image/jpeg";
    } else if (overCand.length > 0) {
      outBlob = overCand.reduce((a, b) => (a.size <= b.size ? a : b));
      outMime =
        outBlob.type === "image/webp" ? "image/webp" : "image/jpeg";
    }

    if (!outBlob) {
      return { ok: false, error: AVATAR_TYPE_NOT_SUPPORTED };
    }

    const ext = outMime === "image/webp" ? "webp" : "jpg";
    const name = ext === "webp" ? "avatar.webp" : "avatar.jpg";

    let previewObjectUrl = "";
    try {
      previewObjectUrl = URL.createObjectURL(outBlob);
    } catch {
      return { ok: false, error: "Couldn't upload avatar. Please try again." };
    }

    const outFile = new File([outBlob], name, {
      type: outMime === "image/webp" ? "image/webp" : "image/jpeg",
      lastModified: Date.now(),
    });
    return { ok: true, file: outFile, previewObjectUrl };
  } catch (e: unknown) {
    console.error("[profiles] avatar normalize crashed", e);
    return { ok: false, error: "Couldn't upload avatar. Please try again." };
  } finally {
    URL.revokeObjectURL(objectUrl);
  }
}
