/** Shared avatar MIME detection (browser + server). JPEG / PNG / WebP only. */

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024;

export type AvatarMime = "image/jpeg" | "image/png" | "image/webp";

const ALLOWED = new Set<string>([
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/jpg",
]);

export async function sniffAvatarMime(blob: Blob): Promise<AvatarMime | null> {
  const peek = blob.slice(0, 64);
  const buf = await peek.arrayBuffer();
  const u = new Uint8Array(buf);
  if (u.length >= 3 && u[0] === 0xff && u[1] === 0xd8 && u[2] === 0xff) {
    return "image/jpeg";
  }
  if (
    u.length >= 8 &&
    u[0] === 0x89 &&
    u[1] === 0x50 &&
    u[2] === 0x4e &&
    u[3] === 0x47 &&
    u[4] === 0x0d &&
    u[5] === 0x0a &&
    u[6] === 0x1a &&
    u[7] === 0x0a
  ) {
    return "image/png";
  }
  if (
    u.length >= 12 &&
    u[0] === 0x52 &&
    u[1] === 0x49 &&
    u[2] === 0x46 &&
    u[3] === 0x46 &&
    u[8] === 0x57 &&
    u[9] === 0x45 &&
    u[10] === 0x42 &&
    u[11] === 0x50
  ) {
    return "image/webp";
  }
  return null;
}

export function normalizeDeclaredMime(declared: string | undefined): AvatarMime | null {
  const t = (declared ?? "").trim().toLowerCase();
  if (!t || !t.startsWith("image/")) return null;
  if (t === "image/jpg") return "image/jpeg";
  if (ALLOWED.has(t)) return t as AvatarMime;
  return null;
}

/** Prefer magic-byte sniff when possible; fallback to declared type (fixes empty mobile MIME). */
export async function resolveAvatarMime(file: File | Blob): Promise<AvatarMime | null> {
  const sniffed = await sniffAvatarMime(file);
  if (sniffed) return sniffed;
  return typeof File !== "undefined" && file instanceof File ?
      normalizeDeclaredMime(file.type)
    : null;
}

export function extForMime(mime: AvatarMime): "jpg" | "png" | "webp" {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    default:
      return "jpg";
  }
}

export function contentTypeForUpload(mime: AvatarMime): string {
  return mime === "image/jpeg" ? "image/jpeg" : mime;
}
