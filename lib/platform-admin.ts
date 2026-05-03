/** Must match `public.is_platform_super_admin()` in supabase/schema.sql (JWT email). */
export const PLATFORM_SUPER_ADMIN_EMAIL =
  process.env.PLATFORM_SUPER_ADMIN_EMAIL ?? "dariusdavid725@gmail.com";

export function isPlatformSuperAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  return (
    email.trim().toLowerCase() === PLATFORM_SUPER_ADMIN_EMAIL.trim().toLowerCase()
  );
}
