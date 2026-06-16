import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function requireUser() {
  const supabase = createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireAdmin() {
  const user = await requireUser();
  const supabase = createAdminClient();
  const { data } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();

  if (data?.role !== "admin") {
    throw new Error("Forbidden");
  }

  return user;
}
