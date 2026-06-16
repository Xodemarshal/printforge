"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser } from "@/lib/guards";
import { reviewSchema } from "@/lib/validators";
import { trackEvent } from "@/lib/utils";

export async function submitReviewAction(formData: FormData) {
  const user = await requireUser();
  const parsed = reviewSchema.safeParse({
    orderItemId: String(formData.get("orderItemId") ?? ""),
    productId: String(formData.get("productId") ?? ""),
    rating: Number(formData.get("rating") ?? 0),
    comment: String(formData.get("comment") ?? "")
  });

  if (!parsed.success) {
    return { error: "Invalid review." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").insert({
    user_id: user.id,
    ...parsed.data,
    approved: true,
    hidden: false
  });

  if (error) {
    return { error: error.message };
  }

  await trackEvent("review_submitted", user.id, { productId: parsed.data.productId });
  return { success: true };
}

export async function updateReviewVisibilityAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const hidden = formData.get("hidden") === "true";
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").update({ hidden }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}

export async function deleteReviewAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  const { error } = await supabase.from("reviews").delete().eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
