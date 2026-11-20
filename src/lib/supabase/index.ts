/**
 * CampusIQ Supabase Client Utilities
 * Configured for Next.js 14 App Router and Supabase SSR.
 */
export { createClient as createBrowserClient } from "./client";
export { createClient as createServerClient } from "./server";

/**
 * Checks whether the required Supabase environment variables have been set.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    process.env.NEXT_PUBLIC_SUPABASE_URL &&
    (process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  );
}
