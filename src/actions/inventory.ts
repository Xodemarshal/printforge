"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/guards";
import { trackEvent } from "@/lib/utils";

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
  return { success: true };
}
