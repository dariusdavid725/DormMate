/**
 * Canonical URL for redirects + Supabase Auth (email confirmations, OAuth).
 * Set `NEXT_PUBLIC_SITE_URL` in production (e.g. https://yourapp.vercel.app).
 */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "").trim() ||
    "http://localhost:3000"
  );
}
