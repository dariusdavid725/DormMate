import { type NextRequest, NextResponse } from "next/server";

import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  /** Prefer Next request origin — more reliable behind proxies than `new URL(request.url)`. */
  const origin = request.nextUrl.origin.replace(/\/+$/, "");

  const code = searchParams.get("code");
  const nextRaw = searchParams.get("next");
  const next =
    nextRaw?.startsWith("/") && !nextRaw.startsWith("//")
      ? nextRaw.split("?")[0] ?? "/dashboard"
      : "/dashboard";

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(new URL(`${next}`, origin));
    }
  }

  return NextResponse.redirect(
    new URL(
      `/login?error=${encodeURIComponent("Could not authenticate. Try again.")}`,
      origin,
    ),
  );
}
