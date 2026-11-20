import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Creates and returns a Supabase client for Server Components, Server Actions,
 * and Route Handlers in Next.js 14 App Router.
 *
 * Uses cookie management via `cookies()` from `next/headers`.
 * Primary environment variables:
 * - NEXT_PUBLIC_SUPABASE_URL
 * - NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY (with fallback to NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */
export function createClient() {
  const cookieStore = cookies();

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return createServerClient(
    supabaseUrl || "https://placeholder-project.supabase.co",
    supabaseKey || "placeholder-publishable-key",
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // In Next.js 14 Server Components, modifying cookies directly is read-only.
            // Ignored if middleware handles token refresh.
          }
        },
      },
    }
  );
}
