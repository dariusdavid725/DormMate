import type { EmailOtpType } from "@supabase/auth-js";
import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

function sanitizeNext(searchParams: URLSearchParams, fallback = "/dashboard"): string {
  const raw = searchParams.get("next");
  if (typeof raw !== "string" || !raw.startsWith("/") || raw.startsWith("//")) {
    return fallback;
  }
  try {
    const u = new URL(raw, "http://dormmate.local");
    const path = u.pathname + u.search;
    if (!path.startsWith("/") || path.startsWith("//")) {
      return fallback;
    }
    return path;
  } catch {
    return fallback;
  }
}

/** Accept `type=` from Supabase email links (signup, recovery, etc.). */
function parseEmailOtpType(raw: string | null): EmailOtpType | null {
  if (!raw) {
    return null;
  }
  const v = raw.toLowerCase();
  const allowed: EmailOtpType[] = [
    "signup",
    "invite",
    "magiclink",
    "recovery",
    "email_change",
    "email",
  ];
  return (allowed as string[]).includes(v) ? (v as EmailOtpType) : null;
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const origin = request.nextUrl.origin.replace(/\/+$/, "");

  const next = sanitizeNext(searchParams);

  const oauthError = searchParams.get("error");
  const oauthDesc = searchParams.get("error_description");
  if (oauthError) {
    const readable = oauthDesc ? `${oauthError}: ${oauthDesc}` : oauthError;
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(readable)}`, origin),
    );
  }

  const tokenHash = searchParams.get("token_hash");
  const otpType = parseEmailOtpType(searchParams.get("type"));

  if (tokenHash && otpType) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType,
    });
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  const code = searchParams.get("code");
  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(next, origin));
    }
  }

  /* No OAuth params — user opened `/auth/callback` directly after email already confirmed. */
  if (!searchParams.toString()) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent(
        "Confirmation link incomplete or expired. Request a new one from signup / password reset.",
      )}`,
      origin,
    ),
  );
}
