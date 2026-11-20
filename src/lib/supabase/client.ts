import { createBrowserClient } from "@supabase/ssr";

/**
 * Creates and returns a Supabase client for browser and client components.
 * Primary environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (with fallback to NEXT_PUBLIC_SUPABASE_ANON_KEY)
 *
 * If credentials are not yet configured, a fallback client is initialized
 * so Next.js static prerendering (npm run build) succeeds without crashing.
 */
export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return createBrowserClient(
      supabaseUrl || "https://placeholder-project.supabase.co",
      supabaseKey || "placeholder-publishable-key"
    );
  }

  return createBrowserClient(supabaseUrl, supabaseKey);
}
