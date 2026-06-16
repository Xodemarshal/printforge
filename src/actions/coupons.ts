"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { couponSchema } from "@/lib/validators";
import { requireAdmin } from "@/lib/guards";

export async function createCouponAction(formData: FormData) {
  await requireAdmin();
  const parsed = couponSchema.safeParse({
    code: formData.get("code"),
    total: Number(formData.get("total") ?? 0)
  });

  if (!parsed.success) {
    return { error: "Invalid coupon." };
  }

  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").insert({
    code: parsed.data.code,
    discount_type: formData.get("discountType") ?? "percentage",
    discount_value: Number(formData.get("discountValue") ?? 0),
    expires_at: formData.get("expiresAt") ?? null,
    usage_limit: Number(formData.get("usageLimit") ?? 0),
    min_order_total: parsed.data.total,
    active: true
  });

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function updateCouponAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  const { error } = await supabase.from("coupons").update({
    code: String(formData.get("code") ?? ""),
    discount_type: formData.get("discountType") ?? "percentage",
    discount_value: Number(formData.get("discountValue") ?? 0),
    expires_at: formData.get("expiresAt") ?? null,
    usage_limit: Number(formData.get("usageLimit") ?? 0),
    min_order_total: Number(formData.get("minOrderTotal") ?? 0),
    active: formData.get("active") === "on"
  }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  return { success: true };
}

export async function validateCouponAction(formData: FormData) {
  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const total = Number(formData.get("total") ?? 0);
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("coupons").select("*").eq("code", code).maybeSingle();
  if (error || !data) {
    return { valid: false, error: "Coupon not found." };
  }
  if (!data.active) {
    return { valid: false, error: "Coupon inactive." };
  }
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, error: "Coupon expired." };
  }
  if (total < Number(data.min_order_total ?? 0)) {
    return { valid: false, error: "Cart total below minimum order value." };
  }
  if (Number(data.usage_limit ?? 0) > 0 && Number(data.times_used ?? 0) >= Number(data.usage_limit)) {
    return { valid: false, error: "Coupon usage limit reached." };
  }

  return {
    valid: true,
    coupon: data
  };
}
