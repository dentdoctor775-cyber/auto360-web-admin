import { createBrowserClient } from "@supabase/auth-helpers-nextjs";

/**
 * Browser Supabase client (uses anon key).
 * Use this in client components for RLS-safe reads/writes.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
