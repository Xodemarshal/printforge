"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin, requireUser } from "@/lib/guards";
import { sendNotification } from "@/services/notifications";
import { trackEvent } from "@/lib/utils";
import { ORDER_STATUSES } from "@/lib/constants";

export async function getCustomerOrders() {
  const user = await requireUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("orders")
    .select("*, order_items(*)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getOrderById(id: string) {
  const user = await requireUser();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("orders").select("*, order_items(*)").eq("id", id).maybeSingle();
  if (error) throw error;
  if (!data) return null;

  const { data: userRow } = await supabase.from("users").select("role").eq("id", user.id).maybeSingle();
  if (userRow?.role !== "admin" && data.user_id !== user.id) {
    throw new Error("Forbidden");
  }

  return data;
}

export async function cancelOrderAction(formData: FormData) {
  const user = await requireUser();
  const id = String(formData.get("id") ?? "");
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("orders").select("id, user_id, status").eq("id", id).maybeSingle();
  if (error) return { error: error.message };
  if (!data || data.user_id !== user.id) {
    return { error: "Order not found." };
  }
  if (!["pending", "confirmed"].includes(data.status)) {
    return { error: "Order can no longer be cancelled." };
  }
  const { error: updateError } = await supabase.from("orders").update({ status: "cancelled" }).eq("id", id);
  if (updateError) return { error: updateError.message };
  return { success: true };
}

export async function updateOrderStatusAction(formData: FormData) {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])) {
    return { error: "Invalid status." };
  }

  const supabase = createAdminClient();
  const { data: order, error } = await supabase.from("orders").select("id, user_id").eq("id", id).maybeSingle();
  if (error) return { error: error.message };
  if (!order) return { error: "Order not found." };

  const { error: updateError } = await supabase.from("orders").update({ status }).eq("id", id);
  if (updateError) return { error: updateError.message };

  await sendNotification(order.user_id, "order_update", "Order status updated", `Your order ${id} is now ${status}.`);
  await trackEvent("admin_action", admin.id, { action: "update_order_status", id, status });
  return { success: true };
}

export async function updatePrintJobAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  const assigned_printer = String(formData.get("assigned_printer") ?? "");
  const supabase = createAdminClient();
  const { error } = await supabase.from("print_jobs").update({
    status,
    assigned_printer: assigned_printer || null
  }).eq("id", id);
  if (error) return { error: error.message };
  return { success: true };
}
