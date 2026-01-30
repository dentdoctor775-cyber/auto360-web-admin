import { createClient } from "@supabase/supabase-js";

/**
 * Server-only admin client (SERVICE ROLE).
 * NEVER expose this key to the browser.
 */
export function createSupabaseAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!;
  if (!key) throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  return createClient(url, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
