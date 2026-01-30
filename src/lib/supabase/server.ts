import { cookies } from "next/headers";
import { createServerComponentClient, createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";

/**
 * Server Component Supabase client (uses anon key + request cookies for auth).
 */
export function createSupabaseServerClient() {
  return createServerComponentClient({
    cookies,
  });
}

/**
 * Route Handler Supabase client (uses anon key + request cookies for auth).
 */
export function createSupabaseRouteClient() {
  return createRouteHandlerClient({
    cookies,
  });
}
