import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createMockSupabaseClient, hasSupabaseConfig } from "@/lib/mock-supabase";

export async function createClient() {
  // Always fallback safe for build / prerender
  if (typeof window === "undefined" && !hasSupabaseConfig()) {
    return createMockSupabaseClient();
  }

  // IMPORTANT: In Next.js 15, cookies() returns a Promise and MUST be awaited
  let cookieStore;
  try {
    cookieStore = await cookies(); 
  } catch {
    // during static generation fallback
    return createMockSupabaseClient();
  }

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
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
            // ignore in server components / static phase
          }
        }
      }
    }
  );
}