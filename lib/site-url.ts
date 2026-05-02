/**
 * Canonical site origin for redirects + Supabase Auth (email confirmations, OAuth).
 * Set `NEXT_PUBLIC_SITE_URL` in production — must be usable by `new URL()` (avoid quotes in env values).
 */

function stripWrappingQuotes(s: string): string {
  const t = s.trim();
  if (
    (t.startsWith('"') && t.endsWith('"')) ||
    (t.startsWith("'") && t.endsWith("'"))
  ) {
    return t.slice(1, -1).trim();
  }
  return t;
}

/** Returns full origin URL e.g. https://your-app.vercel.app (no trailing slash). */
export function normalizeSiteOrigin(
  raw: string | undefined,
): URL | null {
  if (!raw) {
    return null;
  }

  let s = stripWrappingQuotes(raw);
  if (!s) {
    return null;
  }

  try {
    if (!/^https?:\/\//i.test(s)) {
      if (/^(localhost|127\.0\.0\.1)(:\d+)?$/i.test(s) || s.startsWith("localhost")) {
        s = `http://${s.replace(/^\/\//, "")}`;
      } else {
        s = `https://${s.replace(/^\/\//, "")}`;
      }
    }

    const u = new URL(s);
    if (!u.hostname) {
      return null;
    }
    u.hash = "";
    u.pathname = "";
    u.search = "";
    return u;
  } catch {
    return null;
  }
}

export function getSiteUrl(): string {
  const fromEnv = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  if (fromEnv) {
    return fromEnv.origin.replace(/\/+$/, "");
  }
  return "http://localhost:3000";
}

/** Safe `metadataBase` for Next.js — never throws (avoids 500 on bad env). */
export function tryGetMetadataBase(): URL | undefined {
  const u = normalizeSiteOrigin(process.env.NEXT_PUBLIC_SITE_URL);
  return u ?? undefined;
}
