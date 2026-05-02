import { createClient } from "@/lib/supabase/server";

import {
  getSupabaseAnonKey,
  getSupabaseUrl,
} from "@/lib/supabase/env";

async function fetchUserEmailOrNull(): Promise<string | null> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    return user?.email ?? null;
  } catch {
    return null;
  }
}

export default async function Home() {
  const configured = !!(getSupabaseUrl() && getSupabaseAnonKey());
  const userEmail = configured ? await fetchUserEmailOrNull() : null;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 px-6 py-24">
      <div className="text-center">
        <p className="text-sm font-medium tracking-[0.2em] text-zinc-500 uppercase dark:text-zinc-400">
          DormMate
        </p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-50 sm:text-5xl">
          The Intelligent Co-Living OS
        </h1>
        <p className="mx-auto mt-4 max-w-lg text-lg text-zinc-600 dark:text-zinc-400">
          Shared flats, synced money, chores, and focus — minus the roommate
          spreadsheet drama.
        </p>
      </div>

      <div className="w-full max-w-md rounded-xl border border-zinc-200 bg-zinc-50/80 px-5 py-4 text-left text-sm dark:border-zinc-800 dark:bg-zinc-900/60">
        <p className="font-medium text-zinc-900 dark:text-zinc-100">
          Supabase
        </p>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          {!configured && (
            <>
              Set NEXT_PUBLIC_* in{" "}
              <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                web/.env.local
              </code>
              {" "}
              — see{" "}
              <code className="rounded bg-zinc-200 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
                .env.example
              </code>
              .
            </>
          )}
          {configured && <>Connected.{userEmail ? ` Signed in as ${userEmail}.` : " Not logged in yet."}</>}
        </p>
      </div>
    </div>
  );
}
