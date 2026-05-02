/**
 * User-facing strings for failures that must not expose DB internals in production.
 */
export const PUBLIC_TRY_AGAIN = "Something went wrong. Please try again.";

/** Log full Supabase errors on the server; show a safe message in the UI. */
export function shouldExposeSupabaseError(): boolean {
  return process.env.NODE_ENV !== "production";
}
