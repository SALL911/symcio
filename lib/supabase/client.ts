/**
 * Browser-side Supabase client for use in "use client" components.
 *
 * Reads public env vars (NEXT_PUBLIC_*). Session is stored in cookies
 * via @supabase/ssr's cookie-based storage — compatible with the server
 * client in lib/supabase/server.ts.
 */

import { createBrowserClient } from "@supabase/ssr";

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY. " +
        "Set them in Vercel → Settings → Environment Variables.",
    );
  }
  return createBrowserClient(url, anon);
}
