"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/guards";
import { revalidatePath } from "next/cache";

export async function createCouponAction(formData: FormData) {
  try {
    await requireAdmin();
    const supabase = createAdminClient();
    
    const code = String(formData.get("code") ?? "").trim().toUpperCase();
    if (!code) return { error: "Coupon code is required." };

    const { error } = await supabase.from("coupons").insert({
      code,
      discount_type: formData.get("discountType") ?? "percentage",
      discount_value: Number(formData.get("discountValue") ?? 0),
      expires_at: formData.get("expiresAt") || null,
      usage_limit: Number(formData.get("usageLimit") ?? 0) || null,
      min_order_total: Number(formData.get("total") ?? 0),
      active: true
    });

    if (error) throw error;
    
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("Create coupon error:", error);
    return { error: error.message || "Failed to create coupon" };
  }
}

export async function updateCouponAction(formData: FormData) {
  try {
    await requireAdmin();
    const id = String(formData.get("id") ?? "");
    const supabase = createAdminClient();
    
    const { error } = await supabase.from("coupons").update({
      code: String(formData.get("code") ?? "").trim().toUpperCase(),
      discount_type: formData.get("discountType") ?? "percentage",
      discount_value: Number(formData.get("discountValue") ?? 0),
      expires_at: formData.get("expiresAt") || null,
      usage_limit: Number(formData.get("usageLimit") ?? 0),
      min_order_total: Number(formData.get("minOrderTotal") ?? 0),
      active: formData.get("active") === "on"
    }).eq("id", id);

    if (error) throw error;
    
    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    console.error("Update coupon error:", error);
    return { error: error.message || "Failed to update coupon" };
  }
}

export async function validateCouponAction(code: string, total: number) {
  try {
    const supabase = createAdminClient();
    const normalizedCode = code.trim().toUpperCase();
    
    const { data, error } = await supabase
      .from("coupons")
      .select("*")
      .eq("code", normalizedCode)
      .maybeSingle();

    if (error) throw error;
    if (!data) {
      return { valid: false, error: "This coupon code doesn't exist." };
    }
    
    if (!data.active) {
      return { valid: false, error: "This coupon is no longer active." };
    }
    
    if (data.expires_at && new Date(data.expires_at) < new Date()) {
      return { valid: false, error: "This coupon has expired." };
    }
    
    if (total < Number(data.min_order_total ?? 0)) {
      return { 
        valid: false, 
        error: `Minimum order total of ₹${data.min_order_total} required for this coupon.` 
      };
    }
    
    if (data.usage_limit && data.times_used >= data.usage_limit) {
      return { valid: false, error: "This coupon usage limit has been reached." };
    }

    // Calculate discount
    let discountAmount = 0;
    if (data.discount_type === 'percentage') {
      discountAmount = (total * data.discount_value) / 100;
    } else {
      discountAmount = data.discount_value;
    }

    return {
      valid: true,
      coupon: data,
      discountAmount: Math.min(discountAmount, total) // Can't discount more than total
    };
  } catch (error: any) {
    console.error("Validate coupon error:", error);
    return { valid: false, error: "Failed to validate coupon" };
  }
}
