import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/**
 * Session-aware Supabase client for Server Components, Server Actions and
 * Route Handlers. Uses the public anon key + the visitor's auth cookies —
 * this is what tells us *who is logged in*, unlike the service-role admin
 * client in lib/supabase.ts which bypasses auth entirely for trusted writes.
 */
export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
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
            // called from a Server Component with no response to write to —
            // safe to ignore because middleware refreshes the session anyway
          }
        },
      },
    }
  );
}
