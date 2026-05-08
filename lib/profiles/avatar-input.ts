/** Client-only: one file input owns `name="avatar"` (avoids multipart duplicate fields). */
export function assignAvatarFileToInput(
  file: File,
  input: HTMLInputElement | null,
): void {
  if (!input) return;
  const dt = new DataTransfer();
  dt.items.add(file);
  input.files = dt.files;
}

export function clearFileInput(input: HTMLInputElement | null): void {
  if (!input) return;
  input.value = "";
}
