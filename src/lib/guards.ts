import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

export async function getCurrentUser() {
  const supabase = await createClient();
  const {
    data: { user }
  } = await supabase.auth.getUser();
  return user;
}

export async function requireUser(redirectOnFail = true) {
  const user = await getCurrentUser();

  if (!user) {
    if (redirectOnFail) {
      redirect("/login");
    }
    throw new Error("Unauthorized");
  }

  return user;
}

export async function requireAdmin(redirectOnFail = true) {
  const user = await requireUser(redirectOnFail);

  // Use admin client to bypass RLS and check role
  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || data?.role !== "admin") {
    if (redirectOnFail) {
      redirect("/login?error=admin-required");
    }
    throw new Error("Access denied: Admin role required");
  }

  return user;
}
