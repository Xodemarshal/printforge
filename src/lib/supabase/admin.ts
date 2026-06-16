import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { createMockSupabaseClient, hasSupabaseConfig } from "@/lib/mock-supabase";

export function createAdminClient() {
  if (!hasSupabaseConfig()) {
    return createMockSupabaseClient();
  }

  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
    process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""
  );
}
