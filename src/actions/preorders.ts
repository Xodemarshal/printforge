"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser, getCurrentUser } from "@/lib/guards";
import { revalidatePath } from "next/cache";
import type { PreOrderRow, PreOrderRegistrationRow, PreOrderStatus } from "@/types";
import { resolvePreorderPrice } from "@/lib/preorder-utils";



/**
 * Get the currently active, valid preorder for display on the homepage or /prebook page.
 * Conditions: status = 'ACTIVE', start_date <= NOW(), end_date >= NOW(), registration_count < max_quantity.
 */
export async function getActivePreorder(): Promise<PreOrderRow | null> {
  try {
    const supabase = createAdminClient();

    // 1. Fetch preorders matching ACTIVE (or active) status
    const { data: preorders, error } = await supabase
      .from("preorders")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching preorders in getActivePreorder:", error);
      return null;
    }

    if (!preorders || preorders.length === 0) {
      return null;
    }

    const nowMs = Date.now();

    // 2. Find first active preorder whose deadline has not passed
    for (const preorder of preorders) {
      const statusUpper = String(preorder.status || "").toUpperCase();
      if (statusUpper !== "ACTIVE") continue;

      // Check if end_date has passed
      if (preorder.end_date) {
        const endDateMs = new Date(preorder.end_date).getTime();
        if (endDateMs < nowMs) continue; // expired
      }

      // Fetch target product separately
      const { data: product } = await supabase
        .from("products")
        .select("*")
        .eq("id", preorder.product_id)
        .maybeSingle();

      // Get registrations count
      const { count } = await supabase
        .from("preorder_registrations")
        .select("id", { count: "exact", head: true })
        .eq("preorder_id", preorder.id);

      const regCount = count || 0;
      if (!preorder.max_quantity || regCount < preorder.max_quantity) {
        return {
          ...preorder,
          products: product || null,
          registration_count: regCount
        };
      }
    }

    return null;
  } catch (err) {
    console.error("Exception in getActivePreorder:", err);
    return null;
  }
}

/**
 * Returns a map of { [product_id]: preorder_id } for all currently active preorders.
 * Used by shop/listing pages to gate cart access for prebook-only products.
 */
export async function getAllActivePreorderProductIds(): Promise<Record<string, string>> {
  try {
    const supabase = createAdminClient();

    const { data: preorders, error } = await supabase
      .from("preorders")
      .select("id, product_id, status, end_date");

    if (error || !preorders) return {};

    const nowMs = Date.now();
    const map: Record<string, string> = {};

    for (const p of preorders) {
      const statusUpper = String(p.status || "").toUpperCase();
      if (statusUpper !== "ACTIVE") continue;
      if (p.end_date && new Date(p.end_date).getTime() < nowMs) continue;
      if (p.product_id) {
        map[p.product_id] = p.id;
      }
    }

    return map;
  } catch (err) {
    console.error("Exception in getAllActivePreorderProductIds:", err);
    return {};
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
      .select("*")
      .eq("id", id)
      .maybeSingle();

    if (error || !preorder) {
      return null;
    }

    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", preorder.product_id)
      .maybeSingle();

    const { count } = await supabase
      .from("preorder_registrations")
      .select("id", { count: "exact", head: true })
      .eq("preorder_id", preorder.id);

    return {
      ...preorder,
      products: product || null,
      registration_count: count || 0
    };
  } catch (err) {
    console.error("Error in getPreorderById:", err);
    return null;
  }
}

/**
 * Get active preorder campaign associated with a product ID (if any).
 */
export async function getPreorderForProduct(productId: string): Promise<PreOrderRow | null> {
  try {
    const supabase = createAdminClient();
    const { data: preorder } = await supabase
      .from("preorders")
      .select("*")
      .eq("product_id", productId)
      .maybeSingle();

    if (!preorder || String(preorder.status || "").toUpperCase() !== "ACTIVE") {
      return null;
    }

    return preorder as PreOrderRow;
  } catch (err) {
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
 * Get user's active preorder registration with granted access for a product.
 * Returns registration details including special preorder price and reservation fee deduction.
 */
export async function getUserPreorderForProduct(productId: string): Promise<{
  hasAccess: boolean;
  registration: PreOrderRegistrationRow | null;
  specialPrice: number;
  reservationFeePaid: number;
  finalCheckoutPrice: number;
} | null> {
  try {
    const user = await getCurrentUser();
    if (!user) return null;

    const supabase = createAdminClient();
    const { data: registration } = await supabase
      .from("preorder_registrations")
      .select("*, preorders(*), products(*)")
      .eq("user_id", user.id)
      .eq("product_id", productId)
      .eq("payment_status", "paid")
      .eq("granted_access", true)
      .eq("status", "REGISTERED")
      .order("created_at", { ascending: false })
      .maybeSingle();

    if (!registration) return null;

    const baseProductPrice = registration.products?.price || 0;
    // Special price can be locked_price or preorder_price if set, else base price
    const specialPrice = registration.locked_price > 0 ? registration.locked_price : baseProductPrice;
    const reservationFeePaid = Number(registration.reservation_fee_paid || 0);
    const finalCheckoutPrice = Math.max(0, Math.round((specialPrice - reservationFeePaid) * 100) / 100);

    return {
      hasAccess: true,
      registration: registration as PreOrderRegistrationRow,
      specialPrice,
      reservationFeePaid,
      finalCheckoutPrice
    };
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

    // 3. Resolve locked price — preorder_price takes priority over discount_percentage
    const { lockedPrice, discountPercentage: discountPct, savedAmount } = resolvePreorderPrice(preorder);

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

    const savingMsg = savedAmount > 0 ? ` (saving ₹${savedAmount})` : "";
    return {
      success: true,
      alreadyRegistered: false,
      registration,
      lockedPrice,
      discountPercentage: discountPct,
      message: `Prebook confirmed! Your price of ₹${lockedPrice}${savingMsg} has been locked in.`
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
    .select("*")
    .order("created_at", { ascending: false });

  if (error || !preorders) {
    return [];
  }

  // Attach products & registration counts
  const result: PreOrderRow[] = [];
  for (const item of preorders) {
    const { data: product } = await supabase
      .from("products")
      .select("*")
      .eq("id", item.product_id)
      .maybeSingle();

    const { count } = await supabase
      .from("preorder_registrations")
      .select("id", { count: "exact", head: true })
      .eq("preorder_id", item.id);

    result.push({
      ...item,
      products: product || null,
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
  const preorderPriceRaw = formData.get("preorderPrice") as string;
  const preorderPrice = preorderPriceRaw ? parseFloat(preorderPriceRaw) : null;
  const reservationFee = parseFloat((formData.get("reservationFee") as string) || "10");
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
      preorder_price: preorderPrice,
      reservation_fee: reservationFee,
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
  const preorderPriceRaw = formData.get("preorderPrice") as string;
  const preorderPrice = preorderPriceRaw ? parseFloat(preorderPriceRaw) : null;
  const reservationFee = parseFloat((formData.get("reservationFee") as string) || "10");
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
      preorder_price: preorderPrice,
      reservation_fee: reservationFee,
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

export async function toggleGrantAccessAction(registrationId: string, granted: boolean) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: reg, error } = await supabase
    .from("preorder_registrations")
    .update({
      granted_access: granted,
      granted_at: granted ? new Date().toISOString() : null,
      updated_at: new Date().toISOString()
    })
    .eq("id", registrationId)
    .select("preorder_id")
    .single();

  if (error) {
    return { success: false, error: error.message };
  }

  if (reg?.preorder_id) {
    revalidatePath(`/admin/preorders/${reg.preorder_id}`);
    revalidatePath("/prebook");
    revalidatePath("/");
  }

  return { success: true };
}

export async function getPreOrderRegistrations(preorderId: string): Promise<PreOrderRegistrationRow[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: registrations, error } = await supabase
    .from("preorder_registrations")
    .select("*")
    .eq("preorder_id", preorderId)
    .order("created_at", { ascending: false });

  if (error || !registrations) {
    return [];
  }

  const result: PreOrderRegistrationRow[] = [];
  for (const reg of registrations) {
    const [{ data: user }, { data: product }] = await Promise.all([
      supabase.from("users").select("id, name, email, phone").eq("id", reg.user_id).maybeSingle(),
      supabase.from("products").select("*").eq("id", reg.product_id).maybeSingle()
    ]);

    result.push({
      ...reg,
      users: user || null,
      products: product || null
    } as PreOrderRegistrationRow);
  }

  return result;
}

