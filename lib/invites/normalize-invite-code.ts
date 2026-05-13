/**
 * Normalize pasted invite input: trim, extract `code` from URLs or query strings, uppercase.
 */
export function normalizeInviteCodeInput(raw: string): string {
  let s = String(raw ?? "").trim();
  if (!s) return "";

  const codeParam = s.match(/(?:^|[?&#])code=([^&\s#]+)/i);
  if (codeParam?.[1]) {
    try {
      s = decodeURIComponent(codeParam[1].replace(/\+/g, " ")).trim();
    } catch {
      s = codeParam[1].trim();
    }
  } else {
    try {
      if (s.includes("://") || /^https?:/i.test(s)) {
        const u = new URL(s);
        const q = u.searchParams.get("code");
        if (q?.trim()) s = q.trim();
      }
    } catch {
      /* keep s */
    }
  }

  return s.replace(/\s+/g, "").toUpperCase();
}
