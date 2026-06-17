"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireUser } from "@/lib/guards";
import { trackEvent } from "@/lib/utils";

export async function toggleWishlistAction(formData: FormData) {
  const user = await requireUser();
  const productId = String(formData.get("productId") ?? "");
  if (!productId) {
    return { error: "Missing product." };
  }

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("wishlists")
    .select("id")
    .eq("user_id", user.id)
    .eq("product_id", productId)
    .maybeSingle();

  if (data) {
    await supabase.from("wishlists").delete().eq("id", data.id);
  } else {
    await supabase.from("wishlists").insert({ user_id: user.id, product_id: productId });
  }

  await trackEvent("wishlist_toggled", user.id, { productId });
  return { success: true };
}

export async function getWishlistAction() {
  const user = await requireUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("wishlists")
    .select("product_id, products(*)")
    .eq("user_id", user.id);

  if (error) throw error;
  return data ?? [];
}

export async function getWishlistItems() {
  return getWishlistAction();
}
