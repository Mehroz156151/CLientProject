import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          response = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refreshes the session token if expired — required for server-side
  // reads of the session to stay accurate.
  await supabase.auth.getUser();

  return response;
}

// Only the account-related paths actually need a proactively refreshed
// session cookie. The public/agent-side pages (home, contrôles, scanner,
// menu, messages) never check auth, so skipping middleware there
// avoids an extra Supabase Auth round-trip on every one of those
// navigations — that overhead was compounding with each page's own
// getUser() call and occasionally causing slow navigations to fail.
// /verify/:path* IS gated (see verify/[token]/page.tsx) since it's reachable
// straight from a scanned QR code by anyone, logged in or not.
export const config = {
  matcher: [
    "/me",
    "/login",
    "/signup",
    "/profile/new",
    "/profile/edit/:path*",
    "/verify/:path*",
    "/api/players/create",
    "/api/players/update",
    "/api/players/avatar",
    "/api/auth/:path*",
  ],
};
