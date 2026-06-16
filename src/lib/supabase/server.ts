import { cookies } from "next/headers";
import { createServerClient } from "@supabase/ssr";
import { createMockSupabaseClient, hasSupabaseConfig } from "@/lib/mock-supabase";

export function createClient() {
  if (!hasSupabaseConfig()) {
    return createMockSupabaseClient();
  }

  const cookieStore = cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
    {
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value;
        },
        set(name, value, options) {
          try {
            cookieStore.set({ name, value, ...options });
          } catch {
            // Server components may not allow mutation.
          }
        },
        remove(name, options) {
          try {
            cookieStore.set({ name, value: "", ...options, maxAge: 0 });
          } catch {
            // Server components may not allow mutation.
          }
        }
      }
    }
  );
}
