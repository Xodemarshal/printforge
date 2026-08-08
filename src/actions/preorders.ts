"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser, getCurrentUser } from "@/lib/guards";
import { revalidatePath } from "next/cache";
import type { PreOrderRow, PreOrderRegistrationRow, PreOrderStatus } from "@/types";

/**
 * Get the currently active, valid preorder for display on the homepage or /prebook page.
 * Conditions: status = 'ACTIVE', start_date <= NOW(), end_date >= NOW(), registration_count < max_quantity.
 */
export async function getActivePreorder(): Promise<PreOrderRow | null> {
  try {
    const supabase = createAdminClient();
    const now = new Date().toISOString();

    const { data: preorders, error } = await supabase
      .from("preorders")
      .select("*, products(*)")
      .eq("status", "ACTIVE")
      .lte("start_date", now)
      .gte("end_date", now)
      .order("created_at", { ascending: false });

    if (error || !preorders || preorders.length === 0) {
      return null;
    }

    // Filter through preorders to find one that hasn't exceeded max_quantity limit
    for (const preorder of preorders) {
      const { count } = await supabase
        .from("preorder_registrations")
        .select("id", { count: "exact", head: true })
        .eq("preorder_id", preorder.id);

      const regCount = count || 0;
      if (!preorder.max_quantity || regCount < preorder.max_quantity) {
        return {
          ...preorder,
          registration_count: regCount
        };
      }
    }

    return null;
  } catch (err) {
    console.error("Error in getActivePreorder:", err);
    return null;
  }
}

/**
 * Get preorder by ID with product details and registration count.
 */
export async function getPreorderById(id: string): Promise<PreOrderRow | null> {
  try {
    const supabase = createAdminClient();

    const { data: preorder, error } = await supabase
      .from("preorders")
      .select("*, products(*)")
      .eq("id", id)
      .maybeSingle();

    if (error || !preorder) {
      return null;
    }

    const { count } = await supabase
      .from("preorder_registrations")
      .select("id", { count: "exact", head: true })
      .eq("preorder_id", preorder.id);

    return {
      ...preorder,
      registration_count: count || 0
    };
  } catch (err) {
    console.error("Error in getPreorderById:", err);
    return null;
  }
}

/**
 * Get registration details for the currently logged-in user for a specific preorder.
 */
export async function getUserPreorderRegistration(preorderId: string): Promise<PreOrderRegistrationRow | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = createAdminClient();
    const { data: registration } = await supabase
      .from("preorder_registrations")
      .select("*, products(*)")
      .eq("user_id", user.id)
      .eq("preorder_id", preorderId)
      .maybeSingle();

    return registration || null;
  } catch (err) {
    return null;
  }
}

/**
 * Get user's locked preorder price for a product (if they have prebooked it).
 */
export async function getUserPreorderForProduct(productId: string): Promise<PreOrderRegistrationRow | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = createAdminClient();
    const { data: registration } = await supabase
      .from("preorder_registrations")
      .select("*, products(*)")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("status", "REGISTERED")
      .order("created_at", { ascending: false })
      .maybeSingle();

    return registration || null;
  } catch (err) {
    return null;
  }
}

/**
 * Prebook registration action: Locks in the discount & price for the authenticated user.
 */
export async function createPreOrderRegistrationAction(preorderId: string) {
  try {
    const user = await requireUser();
    const supabase = createAdminClient();

    // 1. Fetch preorder & product
    const preorder = await getPreorderById(preorderId);
    if (!preorder) {
      return { success: false, error: "Preorder campaign not found." };
    }

    if (preorder.status !== "ACTIVE") {
      return { success: false, error: `This preorder campaign is currently ${preorder.status.toLowerCase()}.` };
    }

    const now = new Date();
    if (new Date(preorder.start_date) > now) {
      return { success: false, error: "This preorder campaign has not started yet." };
    }
    if (new Date(preorder.end_date) < now) {
      return { success: false, error: "This preorder campaign has already ended." };
    }

    if (preorder.max_quantity && (preorder.registration_count || 0) >= preorder.max_quantity) {
      return { success: false, error: "Sorry! All available preorder slots have been booked." };
    }

    // 2. Check duplicate registration
    const { data: existingReg } = await supabase
      .from("preorder_registrations")
      .select("*")
      .eq("user_id", user.id)
      .eq("preorder_id", preorderId)
      .maybeSingle();

    if (existingReg) {
      return {
        success: true,
        alreadyRegistered: true,
        lockedPrice: existingReg.locked_price,
        discountPercentage: existingReg.discount_percentage,
        message: `You have already prebooked this product. Your locked preorder price is ₹${existingReg.locked_price}.`
      };
    }

    // 3. Lock price calculation based on Product's base price & Preorder discount %
    const productPrice = preorder.products?.price || 0;
    const discountPct = Number(preorder.discount_percentage || 0);
    const discountAmount = (productPrice * discountPct) / 100;
    const lockedPrice = Math.round((productPrice - discountAmount) * 100) / 100;

    // 4. Insert registration record
    const { data: registration, error: insertError } = await supabase
      .from("preorder_registrations")
      .insert({
        user_id: user.id,
        preorder_id: preorder.id,
        product_id: preorder.product_id,
        discount_percentage: discountPct,
        locked_price: lockedPrice,
        status: "REGISTERED"
      })
      .select()
      .single();

    if (insertError) {
      console.error("Error creating preorder registration:", insertError);
      return { success: false, error: "Failed to register preorder. Please try again." };
    }

    revalidatePath("/prebook");
    revalidatePath(`/prebook/${preorderId}`);
    revalidatePath("/");

    return {
      success: true,
      alreadyRegistered: false,
      registration,
      lockedPrice,
      discountPercentage: discountPct,
      message: `Prebook successful! Your price of ₹${lockedPrice} (${discountPct}% off) has been locked.`
    };
  } catch (err: any) {
    if (err?.message === "Unauthorized") {
      return { success: false, error: "Unauthorized", requireLogin: true };
    }
    console.error("Preorder registration error:", err);
    return { success: false, error: err?.message || "Failed to process prebooking request." };
  }
}

/* ==========================================================================
   ADMIN PREORDER ACTIONS
   ========================================================================== */

export async function getAdminPreorders(): Promise<PreOrderRow[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: preorders, error } = await supabase
    .from("preorders")
    .select("*, products(*)")
    .order("created_at", { ascending: false });

  if (error || !preorders) {
    return [];
  }

  // Attach registration counts
  const result: PreOrderRow[] = [];
  for (const item of preorders) {
    const { count } = await supabase
      .from("preorder_registrations")
      .select("id", { count: "exact", head: true })
      .eq("preorder_id", item.id);

    result.push({
      ...item,
      registration_count: count || 0
    });
  }

  return result;
}

export async function createPreOrderAction(formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const bannerUrl = formData.get("bannerUrl") as string;
  const discountPercentage = parseFloat((formData.get("discountPercentage") as string) || "0");
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const maxQuantityRaw = formData.get("maxQuantity") as string;
  const maxQuantity = maxQuantityRaw ? parseInt(maxQuantityRaw, 10) : null;
  const status = (formData.get("status") as PreOrderStatus) || "DRAFT";

  if (!productId || !title || !startDate || !endDate) {
    return { success: false, error: "Product, Title, Start Date, and End Date are required." };
  }

  const { data, error } = await supabase
    .from("preorders")
    .insert({
      product_id: productId,
      title,
      description: description || null,
      banner_url: bannerUrl || null,
      discount_percentage: discountPercentage,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      max_quantity: maxQuantity,
      status
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating preorder:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/preorders");
  revalidatePath("/prebook");
  revalidatePath("/");

  return { success: true, preorder: data };
}

export async function updatePreOrderAction(id: string, formData: FormData) {
  await requireAdmin();
  const supabase = createAdminClient();

  const productId = formData.get("productId") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const bannerUrl = formData.get("bannerUrl") as string;
  const discountPercentage = parseFloat((formData.get("discountPercentage") as string) || "0");
  const startDate = formData.get("startDate") as string;
  const endDate = formData.get("endDate") as string;
  const maxQuantityRaw = formData.get("maxQuantity") as string;
  const maxQuantity = maxQuantityRaw ? parseInt(maxQuantityRaw, 10) : null;
  const status = (formData.get("status") as PreOrderStatus) || "DRAFT";

  const { data, error } = await supabase
    .from("preorders")
    .update({
      product_id: productId,
      title,
      description: description || null,
      banner_url: bannerUrl || null,
      discount_percentage: discountPercentage,
      start_date: new Date(startDate).toISOString(),
      end_date: new Date(endDate).toISOString(),
      max_quantity: maxQuantity,
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating preorder:", error);
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/preorders");
  revalidatePath(`/admin/preorders/${id}`);
  revalidatePath("/prebook");
  revalidatePath("/");

  return { success: true, preorder: data };
}

export async function togglePreOrderStatusAction(id: string, status: PreOrderStatus) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { error } = await supabase
    .from("preorders")
    .update({
      status,
      updated_at: new Date().toISOString()
    })
    .eq("id", id);

  if (error) {
    return { success: false, error: error.message };
  }

  revalidatePath("/admin/preorders");
  revalidatePath("/prebook");
  revalidatePath("/");

  return { success: true };
}

export async function getPreOrderRegistrations(preorderId: string): Promise<PreOrderRegistrationRow[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: registrations, error } = await supabase
    .from("preorder_registrations")
    .select("*, users(id, name, email, phone), products(*)")
    .eq("preorder_id", preorderId)
    .order("created_at", { ascending: false });

  if (error || !registrations) {
    return [];
  }

  return registrations as PreOrderRegistrationRow[];
}
