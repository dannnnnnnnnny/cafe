import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

/** Cookie-bound client for admin auth (server components / actions). */
export async function createSessionSupabase() {
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
              cookieStore.set(name, value, options),
            );
          } catch {
            // Called from a Server Component — middleware would refresh sessions.
          }
        },
      },
    },
  );
}
