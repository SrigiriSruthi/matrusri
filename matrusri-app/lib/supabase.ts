/**
 * Supabase clients
 *
 * Three flavors:
 *  - browserClient  — for client components, uses anon key, respects RLS
 *  - serverClient   — for server components / route handlers, uses anon key
 *  - serviceClient  — server-only, uses service_role key, bypasses RLS
 *                     (use sparingly — only for admin tasks like daily task generation)
 */
import { createBrowserClient, createServerClient, type CookieOptions } from "@supabase/ssr";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
}

// Browser-side client (use in client components)
export function browserClient() {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

// Server-side client (use in server components / route handlers / server actions)
export async function serverClient() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }: { name: string; value: string; options: CookieOptions }) =>
            cookieStore.set(name, value, options)
          );
        } catch {
          // Setting cookies from a Server Component is intentionally a no-op.
          // Middleware refreshes the session — this only fails when called from RSC.
        }
      },
    },
  });
}

// Service-role client (server-only — never expose to browser)
// Bypasses RLS. Use for admin scripts only.
export function serviceClient() {
  if (typeof window !== "undefined") {
    throw new Error("serviceClient() must NOT be called from the browser");
  }
  return createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
