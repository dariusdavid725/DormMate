/** Elimină ghilimele copiate accidental din clipboard în Vercel / .env. */
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

/**
 * Trimite întotdeauna doar ORIGIN-ul proiectului (ex: https://abc.supabase.co).
 * Unele configurări puneau path (/auth/v1, /rest/v1 sau /) și SDK-ul strica URL-uri.
 */
export function normalizeSupabaseProjectUrl(
  raw: string | undefined,
): string | undefined {
  if (!raw) {
    return undefined;
  }

  let s = stripWrappingQuotes(raw);
  if (!s) {
    return undefined;
  }

  if (!/^https?:\/\//i.test(s)) {
    s = `https://${s.replace(/^\/+/, "")}`;
  }

  try {
    const u = new URL(s);
    return u.origin;
  } catch {
    return undefined;
  }
}

export function getSupabaseUrl(): string | undefined {
  return normalizeSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getSupabaseAnonKey(): string | undefined {
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ??
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!key) {
    return undefined;
  }

  const cleaned = stripWrappingQuotes(key.trim());
  return cleaned || undefined;
}

export function requireSupabaseEnv(): { url: string; anonKey: string } {
  const url = getSupabaseUrl();
  const anonKey = getSupabaseAnonKey();

  if (!url || !anonKey) {
    throw new Error(
      "Supabase: lipsește sau e invalid NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. În Vercel pune URL exact de forma https://xxx.supabase.co (fără slash la final, fără path /auth/v1, FĂRĂ ghilimele în jurul valorii).",
    );
  }

  return { url, anonKey };
}
