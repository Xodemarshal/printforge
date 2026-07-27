import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

function resolveDisplayName(user: User) {
  const meta = user.user_metadata as Record<string, any> | undefined;
  const candidate =
    meta?.name ||
    meta?.full_name ||
    meta?.display_name ||
    meta?.username ||
    user.email?.split("@")[0] ||
    "Customer";

  return String(candidate).trim() || "Customer";
}

export async function ensureUserProfile(user: User) {
  const supabase = createAdminClient();

  const { data: profile, error } = await supabase
    .from("users")
    .select("id, name, email, role")
    .eq("id", user.id)
    .maybeSingle();

  if (error) {
    throw error;
  }

  const email = user.email || "";
  const name = resolveDisplayName(user);

  if (profile) {
    const updateData: Record<string, string> = {};

    if (!profile.email && email) {
      updateData.email = email;
    }
    if (!profile.name && name) {
      updateData.name = name;
    }

    if (Object.keys(updateData).length > 0) {
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("id", user.id);

      if (updateError) {
        throw updateError;
      }
    }

    return profile;
  }

  const { data: createdProfile, error: insertError } = await supabase
    .from("users")
    .insert({
      id: user.id,
      name,
      email,
      role: "customer"
    })
    .select("id, name, email, role")
    .single();

  if (insertError) {
    throw insertError;
  }

  return createdProfile;
}
