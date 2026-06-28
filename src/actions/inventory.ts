"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/guards";
import { trackEvent } from "@/lib/utils";
import { revalidatePath } from "next/cache";

export async function updateInventoryAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const quantity = Number(formData.get("quantity") ?? 0);
  const threshold = Number(formData.get("threshold") ?? 0);
  const supabase = createAdminClient();

  const { error } = await supabase.from("inventory").update({
    quantity,
    threshold
  }).eq("id", id);

  if (error) {
    return { error: error.message };
  }

  await supabase.from("inventory_logs").insert({
    inventory_id: id,
    user_id: admin.id,
    quantity_change: quantity,
    note: "Manual inventory update"
  });

  await trackEvent("admin_action", admin.id, { action: "update_inventory", id, quantity, threshold });
  revalidatePath("/admin/inventory");
  return { success: true };
}

export async function addInventoryItemAction(formData: FormData) {
  const admin = await requireAdmin();
  const material = String(formData.get("material") ?? "").trim();
  const quantity = Number(formData.get("quantity") ?? 0);
  const threshold = Number(formData.get("threshold") ?? 0);
  const unit = String(formData.get("unit") ?? "").trim() || null;
  const notes = String(formData.get("notes") ?? "").trim() || null;

  if (!material) return { error: "Material name is required" };

  const supabase = createAdminClient();

  const { error } = await supabase.from("inventory").insert({
    material,
    quantity,
    threshold,
    unit,
    notes
  });

  if (error) return { error: error.message };

  await trackEvent("admin_action", admin.id, { action: "add_inventory_item", material, quantity, threshold });
  revalidatePath("/admin/inventory");
  return { success: true };
}
