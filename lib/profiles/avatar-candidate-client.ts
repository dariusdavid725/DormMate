/** Client-side only: pick validation before decode/compress (no "use client" — import from client code). */

export const AVATAR_RAW_MAX_BYTES = 15 * 1024 * 1024;

export const AVATAR_TYPE_NOT_SUPPORTED =
  "This file type is not supported. Please choose a photo.";

const EXT_OK = /\.(jpe?g|png|webp|heic|heif)$/i;

const MIME_OK = new Set([
  "",
  "image/jpeg",
  "image/jpg",
  "image/pjpeg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

export function validateAvatarCandidateFile(file: File): string | null {
  if (!file || file.size === 0) {
    return "No image selected.";
  }
  if (file.size > AVATAR_RAW_MAX_BYTES) {
    return "Please choose a smaller image.";
  }
  const mime = (file.type ?? "").trim().toLowerCase();
  const extOk = EXT_OK.test(file.name ?? "");
  const mimeOk = MIME_OK.has(mime);
  if (!mimeOk && !extOk) {
    return AVATAR_TYPE_NOT_SUPPORTED;
  }
  return null;
}
