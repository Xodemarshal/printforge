import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireUser() {
  const supabase = await createClient();
  const {
    data: { user },
    error
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();

  // Use admin client to bypass RLS and check role
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error) {
    throw new Error(`Failed to fetch user role: ${error.message}`);
  }

  if (data?.role !== "admin") {
    throw new Error("Access denied: Admin role required");
  }

  return user;
}
